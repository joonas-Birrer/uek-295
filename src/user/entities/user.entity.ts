import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  username: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  createdAt: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  updatedAt: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @Column({ type: 'int', default: 1 })
  createdById: number;

  @Column({ type: 'int', default: 1 })
  updatedById: number;
}
