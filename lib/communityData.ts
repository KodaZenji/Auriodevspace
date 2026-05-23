// Community-submitted job boards
// These are added manually after review of GitHub issues
// To submit a board: https://github.com/KodaZenji/japadev/issues/new?template=submit-job-board.yml

export interface CommunityBoard {
  name: string;
  url: string;
  category: string;
  submittedBy: string;
  remote: boolean;
  nigerianFriendly: boolean;
  note?: string;
}

export const COMMUNITY_BOARDS: CommunityBoard[] = [
  // Starter entries — replace with real submissions as they come in
  {
    name: "Andela Jobs",
    url: "https://andela.com/talent/",
    category: "African + International",
    submittedBy: "KodaZenji",
    remote: true,
    nigerianFriendly: true,
    note: "Built specifically to place African engineers globally",
  },
  {
    name: "Moniepoint Careers",
    url: "https://moniepoint.com/careers",
    category: "African + International",
    submittedBy: "KodaZenji",
    remote: true,
    nigerianFriendly: true,
    note: "Fast-growing Nigerian fintech with international structure",
  },
];

export const GITHUB_ISSUE_URL =
  "https://github.com/KodaZenji/Auriodevspace/issues/new?template=submit-job-board.yml";
