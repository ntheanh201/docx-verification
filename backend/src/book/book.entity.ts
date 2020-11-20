import {User} from 'src/user/user.entity';
import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {AutoMap} from '@nartc/automapper';

export enum BookStatus {
    Pending = 'pending',
    Done = 'done',
}

@Entity()
export class Book {
    @AutoMap()
    @PrimaryGeneratedColumn()
    id?: number;
    @AutoMap()
    @Column()
    name: string;
    @AutoMap()
    @Column({name: 'saved_name'})
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
    @Column()
    total_pages: number;
    @AutoMap()
    @Column({nullable: true})
    audio_url?: string;
    @AutoMap()
    @Column()
    status: BookStatus;
    @Column()
    default_voice?: string;
    @AutoMap()
    @ManyToOne(() => User)
    uploader: number;
    @Column({nullable: true, default: () => `now()`})
    created_at?: Date;
}
