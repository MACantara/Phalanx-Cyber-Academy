export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  author: string;
  author_credentials: string;
  website: string;
  content: string;
  label: 0 | 1;
  source_type: string;
}

export const articles: NewsArticle[] = [
  {
    id: 'real_001',
    title: 'Senatorial Candidates Release Policy Platforms Ahead of May 2025 Midterm Elections',
    date: '2025-03-15T14:30:00.000Z',
    author: 'Maria Santos',
    author_credentials: 'Political Reporter, Rappler',
    website: 'rappler.com',
    content: 'MANILA — Leading senatorial candidates released detailed policy proposals this week as the May 2025 midterm election approaches...',
    label: 0,
    source_type: 'legitimate_news',
  },
  {
    id: 'fake_001',
    title: 'SHOCKING: PCOS Machines Programmed to FLIP Votes - Whistleblower Reveals Election Rigging System!',
    date: '2025-03-16T23:47:00.000Z',
    author: 'Staff Writer',
    author_credentials: '',
    website: 'truthpilipinasnews.net',
    content: 'BREAKING: A brave COMELEC technician has come forward with PROOF that PCOS voting machines are programmed to automatically change votes...',
    label: 1,
    source_type: 'fake_news',
  },
  {
    id: 'real_002',
    title: 'COMELEC Expands Online Voter Registration Access for 2025 Elections',
    date: '2025-02-12T16:45:00.000Z',
    author: 'Michael Cruz',
    author_credentials: 'Political Correspondent, Philippine Daily Inquirer',
    website: 'inquirer.net',
    content: 'Election officials from the Commission on Elections reported continued growth in voter registration...',
    label: 0,
    source_type: 'legitimate_news',
  },
  {
    id: 'fake_002',
    title: 'EXPOSED: Dead People Voting by the Millions - Secret Database Proves Massive Voter Fraud!',
    date: '2025-03-14T18:22:00.000Z',
    author: 'Patriot Juan',
    author_credentials: 'Election Integrity Investigator',
    website: 'electiontruthdotph.com',
    content: 'EXCLUSIVE investigation reveals that over 3 MILLION dead people are still registered to vote in the Philippines...',
    label: 1,
    source_type: 'fake_news',
  },
  {
    id: 'real_003',
    title: 'GMA Network Hosts Major Senatorial Debate for 2025 Elections',
    date: '2025-02-02T11:20:00.000Z',
    author: 'Dr. Emma de Leon',
    author_credentials: 'Political Correspondent, ABS-CBN News',
    website: 'news.abs-cbn.com',
    content: 'MANILA — GMA Network successfully hosted a senatorial debate featuring 12 candidates...',
    label: 0,
    source_type: 'legitimate_news',
  },
  {
    id: 'fake_003',
    title: 'URGENT: COMELEC Chairman ADMITS Election Results Already Predetermined - Leaked Audio Reveals SHOCKING Truth!',
    date: '2025-03-13T20:15:00.000Z',
    author: 'Anonymous Patriot',
    author_credentials: 'Investigative Journalist',
    website: 'pilipinasfraudwatch.net',
    content: 'BOMBSHELL: A leaked audio recording reveals COMELEC Chairman admitting that the May election results are already decided...',
    label: 1,
    source_type: 'fake_news',
  },
];
