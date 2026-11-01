export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface FocusArea {
  id: string;
  number: string;
  title: string;
  summary: string;
  accentColor: 'blue' | 'green' | 'red' | 'amber';
  accentHex: string;
  scope: string[];
  deliverablesSummary: string;
  iconName: string;
}

export interface Director {
  id: string;
  name: string;
  role: string;
  image: string;
}

export const SITE_CONFIG = {
  brand: {
    name: 'NextGen',
    tagline: 'Leading Today, Shaping Tomorrow.',
    shortBio: 'A multidisciplinary organisation working across technology, education, social services, and community development to create meaningful opportunities.',
  },
  
  navigation: [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'about', label: 'About Us', href: '#about' },
    { id: 'focus-areas', label: 'Focus Areas', href: '#focus-areas' },
    { id: 'vision-mission', label: 'Vision & Mission', href: '#vision-mission' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ] as NavItem[],

  hero: {
    badge: 'Official Corporate Portal',
    headlinePrefix: 'Leading Today,',
    headlineHighlight: 'Shaping Tomorrow.',
    subtext: 'NextGen is a forward-looking organisation dedicated to creating meaningful opportunities through technology, education, social services, and grassroots community development.',
    primaryCta: 'Discover NextGen',
    secondaryCta: 'Get in Touch',
  },

  about: {
    badge: 'About NextGen',
    heading: 'Bridging Innovation, Learning, and Social Impact',
    overview: 'NextGen is an initiative designed to harness modern capability for public and community good. We believe that lasting societal advancement happens at the intersection of practical technology, accessible knowledge, and compassionate social support.',
    purposeHeading: 'Our Purpose',
    purposeText: 'Our primary objective is to build sustainable pathways for empowerment. By addressing real-world operational challenges for community organisations and unlocking digital opportunities for individuals, NextGen provides the groundwork for collective progress.',
    approachHeading: 'Multidisciplinary Approach',
    approachText: 'Rather than isolating technical development from social responsibility, NextGen integrates software craft, educational empowerment, and civic engagement into a cohesive mission. Every initiative is grounded in responsibility, accessibility, and measurable utility.',
    pillars: [
      {
        title: 'Technology as an Enabler',
        desc: 'Developing dependable, user-friendly digital tools that simplify operations and improve organisational reach.',
        color: '#125EA2',
      },
      {
        title: 'Empowerment via Education',
        desc: 'Demystifying modern digital competencies and practical skills to prepare learners for an evolving world.',
        color: '#388E3C',
      },
      {
        title: 'Social Responsibility',
        desc: 'Ensuring that public benefit, guidance, and assistance remain central to all our collaborative efforts.',
        color: '#ED2924',
      },
      {
        title: 'Community Cohesion',
        desc: 'Fostering collective participation, civic awareness, and cooperative growth across local environments.',
        color: '#FFA726',
      },
    ],
    directorsBadge: 'Leadership & Governance',
    directorsHeading: 'Board of Directors',
    directorsSubtext: 'The executive directors guiding NextGen’s multidisciplinary mission across technology, education, social services, and community impact.',
    directors: [
      {
        id: 'muhammed-rihab',
        name: 'Muhammed Rihab',
        role: 'Director, NextGen',
        image: '/directors/muhammed-rihab.png',
      },
      {
        id: 'muhammed-sadath',
        name: 'Muhammed Sadath',
        role: 'Director, NextGen',
        image: '/directors/muhammed-sadath.png',
      },
      {
        id: 'sayyid-fazal-al-bukhari',
        name: 'Sayyid Fazal Al Bukhari',
        role: 'Director, NextGen',
        image: '/directors/sayyid-fazal-al-bukhari.png',
      },
      {
        id: 'muhammed-razik',
        name: 'Muhammed Razik',
        role: 'Director, NextGen',
        image: '/directors/muhammed-razik.png',
      },
      {
        id: 'akbar',
        name: 'Akbar',
        role: 'Director, NextGen',
        image: '/directors/akbar.png',
      },
    ] as Director[],
  },

  focusAreas: [
    {
      id: 'tech-solutions',
      number: '01',
      title: 'Technology and Software Solutions',
      summary: 'Delivering dependable digital solutions, purpose-built software architectures, and practical technical support for community organisations, non-profits, and growing enterprises.',
      accentColor: 'blue',
      accentHex: '#125EA2',
      iconName: 'CodeXml',
      scope: [
        'Accessible, modern web portals and platforms',
        'Organisational management and record digitization',
        'Secure data workflows and administrative automation',
        'Technical advisory and infrastructure consulting',
      ],
      deliverablesSummary: 'Building robust, modern software tailored to institutional and civic workflows.',
    },
    {
      id: 'education-tutorials',
      number: '02',
      title: 'Education and Tutorials',
      summary: 'Creating structured learning opportunities, educational guidance, and openly accessible tutorials that demystify technical and modern concepts for diverse audiences.',
      accentColor: 'green',
      accentHex: '#388E3C',
      iconName: 'GraduationCap',
      scope: [
        'Plain-language educational resources and tutorials',
        'Foundational digital learning and tech awareness',
        'Guided educational pathways and curated references',
        'Workshops on contemporary digital tools and workflows',
      ],
      deliverablesSummary: 'Providing clear, structured knowledge that equips individuals with real competence.',
    },
    {
      id: 'social-services',
      number: '03',
      title: 'Social Services',
      summary: 'Spearheading initiatives intended to support people, assist vulnerable groups, and improve access to public resources, welfare mechanisms, and civic opportunities.',
      accentColor: 'red',
      accentHex: '#ED2924',
      iconName: 'HeartHandshake',
      scope: [
        'Informational support on eligible public welfare schemes',
        'Civic assistance and documentation guidance',
        'Grassroots outreach and social coordination',
        'Collaborative partnerships with local welfare groups',
      ],
      deliverablesSummary: 'Facilitating dignified, practical assistance and access to vital societal opportunities.',
    },
    {
      id: 'digital-skills',
      number: '04',
      title: 'Digital Skills and Professional Development',
      summary: 'Equipping individuals with practical digital learning, creative capabilities, modern tooling literacy, and the professional competencies needed for today’s economy.',
      accentColor: 'amber',
      accentHex: '#FFA726',
      iconName: 'Sparkles',
      scope: [
        'Hands-on workplace digital productivity tools',
        'Creative media and no-code digital skill sets',
        'Emerging AI tooling and modern workflow literacy',
        'Career readiness and professional mentoring pathways',
      ],
      deliverablesSummary: 'Cultivating sustainable capabilities that translate directly into career confidence.',
    },
    {
      id: 'community-development',
      number: '05',
      title: 'Community Development',
      summary: 'Fostering sustained community participation, public awareness, collective problem solving, and capacity-building across neighbourhoods and civic bodies.',
      accentColor: 'blue',
      accentHex: '#125EA2',
      iconName: 'UsersRound',
      scope: [
        'Civic engagement and community dialogue forums',
        'Capacity enhancement for local welfare committees',
        'Youth leadership and voluntary initiative facilitation',
        'Neighbourhood digital empowerment programs',
      ],
      deliverablesSummary: 'Strengthening community resilience through shared responsibility and active collaboration.',
    },
  ] as FocusArea[],

  visionMission: {
    vision: {
      label: 'Our Vision',
      statement: 'To contribute to a future where technology, education, and opportunities help individuals and communities progress.',
      interpretation: 'We envision a connected society where knowledge is equitable, technology is an uplifting force, and every community has the digital capacity to thrive independently.',
    },
    mission: {
      label: 'Our Mission',
      statement: 'To make learning, digital solutions, and meaningful social support more accessible through practical initiatives and responsible collaboration.',
      interpretation: 'We carry out this mission by developing real-world software, providing transparent educational frameworks, and maintaining an enduring commitment to grassroots community service.',
    },
  },

  contact: {
    badge: 'Connect With NextGen',
    heading: 'Start a Conversation With Us',
    subtext: 'Whether you represent a community organisation, an educational institution, a partner organisation, or an individual seeking guidance, we invite you to connect.',
    details: [
      {
        label: 'Official Email',
        value: 'official.nextgenorg@gmail.com',
        isPlaceholder: false,
        placeholderNote: '',
        icon: 'Mail',
      },
      {
        label: 'Administrative Office',
        value: 'Area: By Pass Road, Beside Bharath Benz Showroom\nPost: Urgadur\nDistrict: Shimoga\nPin: 577203\nKarnataka - India',
        isPlaceholder: false,
        placeholderNote: '',
        icon: 'MapPin',
      },
      {
        label: 'Operating Hours',
        value: 'Monday – Friday: 9:30 AM – 5:30 PM (IST)',
        isPlaceholder: false,
        placeholderNote: '',
        icon: 'Clock',
      },
    ],
    socialNotice: 'Official verified social channels will be linked upon public rollout.',
  },

  footer: {
    copyright: `© ${new Date().getFullYear()} NextGen. All rights reserved.`,
    legalNote: 'NextGen is a multidisciplinary organisation committed to technology, education, social services, and community development.',
  },
} as const;
