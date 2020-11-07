import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column()
  name: string;
  @Column()
  url: string;
  @ManyToOne(() => User)
  uploader: number;
}
