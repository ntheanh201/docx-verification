import { Book } from 'src/book/book.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { AutoMap } from 'nestjsx-automapper';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id?: number;
  @Column({ unique: true })
  @AutoMap()
  username: string;
  @Column()
  password: string;
  @Column()
  @AutoMap()
  name: string;
  @OneToMany(() => Book, (book) => book.uploader)
  books: Book[];
}
