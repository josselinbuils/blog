export interface BlogPost {
  content: string;
  description: string;
  history: {
    commitHash: string;
    commitSubject: string;
    commitTimestamp: number;
  }[];
  slug: string;
  title: string;
}
