export interface BlogPost {
  content: string;
  description: string;
  history: {
    commitDate: string;
    commitHash: string;
    commitSubject: string;
  }[];
  readingTime: string;
  slug: string;
  title: string;
}
