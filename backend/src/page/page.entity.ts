import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  book_id: number;
  @Column()
  page_num: number;
  @Column()
  status: PageStatus;
  @Column()
  reviewer: number;
  @Column()
  text_raw: string;
  @Column()
  text_norm: string;
  @Column()
  task_id: string;
  @Column()
  audio_url: string;
}

export enum PageStatus {
  Waiting = 'waiting',
  Pending = 'pending',
  Verified = 'verified',
}
