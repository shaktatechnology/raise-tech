import React from 'react';
import { SERVICES_PAGE_DATA } from '@/lib/data/servicesData';
import ServiceDetailSection from './ServiceDetailSection';

export default function ServicesPageContent() {
  return (
    <div className="w-full">
      {SERVICES_PAGE_DATA.map((service) => (
        <ServiceDetailSection key={service.id} service={service} />
      ))}
    </div>
  );
}
