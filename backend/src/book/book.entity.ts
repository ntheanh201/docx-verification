import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@nartc/automapper';

@Entity()
export class Book {
  @AutoMap()
  @PrimaryGeneratedColumn()
  id?: number;
  @AutoMap()
  @Column()
  name: string;
  @AutoMap()
  @Column({ name: 'saved_name' })
  saved_name: string;
  @Column()
  url: string;
  @AutoMap()
  @Column()
  size: number;
  @AutoMap()
  @Column()
  mimetype: string;

  @AutoMap()
  @ManyToOne(() => User)
  uploader: number;
}
