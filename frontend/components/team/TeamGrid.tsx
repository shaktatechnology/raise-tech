"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { fetchApi, getImageUrl } from "@/lib/api";
import StaggerGroup from "@/components/motion/StaggerGroup";
import StaggerItem from "@/components/motion/StaggerItem";

interface TeamMemberAPI {
  id: number;
  name: string;
  position: string;
  image: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export default function TeamGrid() {
  const [members, setMembers] = useState<TeamMemberAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const res = await fetchApi<{ status: string; data: TeamMemberAPI[] }>("/team");
        setMembers(res.data || []);
      } catch {
        // Silently fail on public page
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-8 h-8 border-4 border-[#01A7E5] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Loading team members...</p>
        </div>
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="w-full py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">Our team page is being updated. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <StaggerGroup className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-x-12 lg:gap-y-20">
          {members.map((member) => {
            const imageSrc = getImageUrl(member.image);
            return (
              <StaggerItem key={member.id}>
                <div
                  className="flex flex-col lg:flex-row items-center justify-center w-full max-w-lg lg:max-w-none mx-auto group"
                >
                  {/* Member Photo */}
                  <div className="relative w-full max-w-[280px] h-[320px] sm:h-[365px] shrink-0 rounded-xl overflow-hidden shadow-md z-0 transition-transform duration-300 group-hover:scale-[1.02]">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={`Photo of ${member.name}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 280px, 280px"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#01A7E5]/20 to-[#01A7E5]/5 flex items-center justify-center">
                        <span className="text-5xl font-extrabold text-[#01A7E5]/40">
                          {member.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Information Card */}
                  <div className="w-full lg:w-[335px] min-h-[280px] lg:min-h-[305px] bg-white rounded-xl shadow-[0px_4px_15px_0px_rgba(0,0,0,0.12)] p-6 sm:p-7 flex flex-col justify-between -mt-8 lg:mt-0 lg:-ml-12 z-10 border border-gray-100/80 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-[#01A7E5] tracking-tight leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-sm font-normal italic text-gray-700 mt-1 mb-3">
                        {member.position}
                      </p>
                      <p className="text-sm font-normal italic text-[#3c3c3c] leading-relaxed">
                        {member.description || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
