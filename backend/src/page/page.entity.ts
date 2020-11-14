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
  @Column({ nullable: true })
  reviewer: number;
  @Column({ type: 'longtext' })
  text_raw: string;
  @Column({ type: 'longtext' })
  text_norm: string;
  @Column({ nullable: true })
  task_id: string;
  @Column({ nullable: true })
  voice_id: string;
  @Column({ nullable: true })
  audio_url: string;
  @Column()
  uploader: number;
}

export enum PageStatus {
  Waiting = 'waiting',
  Pending = 'pending',
  Verified = 'verified',
}
