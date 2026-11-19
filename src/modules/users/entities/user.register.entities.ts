import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class UserRigestration {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    fname: string;

    @Column({
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    lname: string;

    @Column({
        type: 'varchar',
        length: 10,
        nullable: false,
        unique: true,
    })
    mobileno: number;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: true,
    })
    email: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
        select: false,
    })
    password: string;

    @CreateDateColumn({
        type: 'timestamp',
    })
    createdAt: Date;
}