<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ManagedImageStorage
{
    /**
     * Save a model mutation and safely apply an optional image replacement/removal.
     * A replacement takes precedence when both an upload and a removal flag are sent.
     */
    public function save(
        Model $model,
        string $attribute,
        ?UploadedFile $replacement,
        bool $remove,
        string $directory,
    ): void {
        $this->saveMany($model, [[
            'attribute' => $attribute,
            'replacement' => $replacement,
            'remove' => $remove,
            'directory' => $directory,
        ]]);
    }

    /**
     * Atomically persist one model update containing several managed image changes.
     * New files are cleaned if any upload or the database save fails; old files are
     * deleted only after the model save succeeds.
     *
     * @param  array<int, array{attribute: string, replacement: ?UploadedFile, remove: bool, directory: string}>  $mutations
     */
    public function saveMany(Model $model, array $mutations): void
    {
        $oldValues = [];
        $newFiles = [];

        try {
            foreach ($mutations as $mutation) {
                $attribute = $mutation['attribute'];
                $oldValues[$attribute] = $model->getAttribute($attribute);

                if ($mutation['replacement']) {
                    $newPath = $this->storeUpload($mutation['replacement'], $mutation['directory']);
                    $newFiles[] = [
                        'path' => $newPath,
                        'directory' => $mutation['directory'],
                        'attribute' => $attribute,
                    ];
                    $model->setAttribute($attribute, $newPath);
                } elseif ($mutation['remove']) {
                    $model->setAttribute($attribute, null);
                }
            }

            $model->save();
        } catch (Throwable $exception) {
            foreach ($newFiles as $newFile) {
                $this->deleteManaged(
                    $newFile['path'],
                    $newFile['directory'],
                    $model,
                    $newFile['attribute'],
                );
            }

            throw $exception;
        }

        foreach ($mutations as $mutation) {
            $attribute = $mutation['attribute'];
            $oldValue = $oldValues[$attribute] ?? null;

            if (($mutation['replacement'] || $mutation['remove'])
                && $oldValue
                && $oldValue !== $model->getAttribute($attribute)) {
                $this->deleteManaged(
                    (string) $oldValue,
                    $mutation['directory'],
                    $model,
                    $attribute,
                );
            }
        }
    }

    public function storeUpload(UploadedFile $file, string $directory): string
    {
        $storedPath = $file->store($directory, 'public');

        if (! is_string($storedPath) || $storedPath === '') {
            throw new RuntimeException('The image could not be stored.');
        }

        return $storedPath;
    }

    /**
     * Delete only files that resolve inside the expected public-disk directory.
     */
    public function deleteManaged(
        ?string $storedValue,
        string $directory,
        Model $model,
        string $attribute,
    ): void {
        $path = $this->managedPath($storedValue, $directory);

        if (! $path) {
            return;
        }

        try {
            $disk = Storage::disk('public');
            $deleted = $disk->delete($path);

            if (! $deleted && $disk->exists($path)) {
                Log::warning('A managed image could not be deleted after a database update.', [
                    'model' => $model::class,
                    'model_id' => $model->getKey(),
                    'attribute' => $attribute,
                ]);
            }
        } catch (Throwable $exception) {
            Log::warning('A managed image deletion raised an exception after a database update.', [
                'model' => $model::class,
                'model_id' => $model->getKey(),
                'attribute' => $attribute,
                'exception' => $exception::class,
            ]);
        }
    }

    private function managedPath(?string $storedValue, string $directory): ?string
    {
        if (! $storedValue || str_contains($storedValue, "\0")) {
            return null;
        }

        $value = str_replace('\\', '/', rawurldecode(trim($storedValue)));
        $diskUrl = rtrim(Storage::disk('public')->url(''), '/');

        if (filter_var($value, FILTER_VALIDATE_URL)) {
            $valueParts = parse_url($value);
            $diskParts = parse_url($diskUrl);

            if (! $valueParts || ! $diskParts
                || strtolower($valueParts['scheme'] ?? '') !== strtolower($diskParts['scheme'] ?? '')
                || strtolower($valueParts['host'] ?? '') !== strtolower($diskParts['host'] ?? '')
                || ($valueParts['port'] ?? null) !== ($diskParts['port'] ?? null)) {
                return null;
            }

            $diskPrefix = rtrim($diskParts['path'] ?? '/storage', '/').'/';
            $urlPath = $valueParts['path'] ?? '';

            if (! str_starts_with($urlPath, $diskPrefix)) {
                return null;
            }

            $value = substr($urlPath, strlen($diskPrefix));
        } else {
            $value = ltrim(strtok($value, '?#') ?: '', '/');
            if (str_starts_with($value, 'storage/')) {
                $value = substr($value, strlen('storage/'));
            }
        }

        $value = trim($value, '/');
        $segments = explode('/', $value);
        $expectedPrefix = trim($directory, '/').'/';

        if ($value === ''
            || in_array('', $segments, true)
            || in_array('.', $segments, true)
            || in_array('..', $segments, true)
            || ! str_starts_with($value, $expectedPrefix)) {
            return null;
        }

        return $value;
    }
}
