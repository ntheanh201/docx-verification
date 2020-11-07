import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Page {
  @PrimaryGeneratedColumn()
  id?: number;
  book_id: number;
  @Column()
  page_num: number;
  @Column()
  status: string;
  @Column()
  reviewer: number;
  @Column()
  text_raw: string;
  @Column()
  text_norm: string;
  @Column()
  task_id: number;
  @Column()
  audio_url: string;
}
