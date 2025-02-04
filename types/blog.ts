export interface BlogPost {
  id: string;
  title: string;
  authorName: string;
  likes: number;
  views: number;
  comments: any[];
  createdAt: string | Date; // ✅ Allow both formats
}

