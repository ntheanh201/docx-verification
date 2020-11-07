import { Book } from 'src/book/book.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string;
  @Column()
  name: string;
  @OneToMany(() => Book, (book) => book.uploader)
  books: Book[];
}
