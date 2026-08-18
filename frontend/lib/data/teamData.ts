// NOTE: Placeholder team member data from approved Figma design. Final content to be provided by backend or project owner.

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  imageAlt: string;
  socialLinks?: SocialLinks;
}

export const TEAM_MEMBERS_DATA: TeamMember[] = [
  {
    id: 'tm-001',
    name: 'Aarav Bhattarai',
    role: 'Software Engineer',
    bio: 'Lorem ipsum dolor sit amet consectetur. Amet sem enim vel commodo cursus. Auctor blandit eget sollicitudin tortor tempor mattis.Lorem ipsum dolor sit amet consectetur.',
    image: '/images/team/team-aarav-bhattarai.png',
    imageAlt: 'Portrait of Aarav Bhattarai',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'tm-002',
    name: 'Anjali Mishra',
    role: 'UI/UX Designer',
    bio: 'Lorem ipsum dolor sit amet consectetur. Amet sem enim vel commodo cursus. Auctor blandit eget sollicitudin tortor tempor mattis.Lorem ipsum dolor sit amet consectetur.',
    image: '/images/team/team-anjali-mishra.png',
    imageAlt: 'Portrait of Anjali Mishra',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'tm-003',
    name: 'Bikash Maharjan',
    role: 'Lead Developer',
    bio: 'Lorem ipsum dolor sit amet consectetur. Amet sem enim vel commodo cursus. Auctor blandit eget sollicitudin tortor tempor mattis.Lorem ipsum dolor sit amet consectetur.',
    image: '/images/team/team-bikash-maharjan.png',
    imageAlt: 'Portrait of Bikash Maharjan',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'tm-004',
    name: 'Aarav Bhattarai',
    role: 'Product Manager',
    bio: 'At Raise Tech, we think technology should improve efficiency, streamline procedures, and produce genuine business value. Our team of talented experts designs and develops scalable, secure, and user-friendly solutions by fusing technical know-how with innovative problem-solving techniques.',
    image: '/images/team/team-aarav-bhattarai.png',
    imageAlt: 'Portrait of Aarav Bhattarai',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'tm-005',
    name: 'Anjali Mishra',
    role: 'Chief Technology Officer',
    bio: 'At Raise Tech, we think technology should improve efficiency, streamline procedures, and produce genuine business value. Our team of talented experts designs and develops scalable, secure, and user-friendly solutions by fusing technical know-how with innovative problem-solving techniques.',
    image: '/images/team/team-aarav-bhattarai.png',
    imageAlt: 'Portrait of Anjali Mishra',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
  {
    id: 'tm-006',
    name: 'Bikash Maharjan',
    role: 'Founder & CEO',
    bio: 'Lorem ipsum dolor sit amet consectetur. Amet sem enim vel commodo cursus. Auctor blandit eget sollicitudin tortor tempor mattis.Lorem ipsum dolor sit amet consectetur.',
    image: '/images/team/team-bikash-maharjan.png',
    imageAlt: 'Portrait of Bikash Maharjan',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      linkedin: 'https://linkedin.com',
    },
  },
];
