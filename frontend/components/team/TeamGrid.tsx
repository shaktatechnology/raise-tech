import React from 'react';
import { TEAM_MEMBERS_DATA } from '@/lib/data/teamData';
import TeamMemberCard from './TeamMemberCard';

export default function TeamGrid() {
  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-x-12 lg:gap-y-20">
          {TEAM_MEMBERS_DATA.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
