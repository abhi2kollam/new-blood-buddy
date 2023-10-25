import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async add(user: User): Promise<User> {
    const newUser = await this.userRepository.create(user);
    return await this.userRepository.save(newUser);
  }

  async get(id: number): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, user: Partial<User>): Promise<User> {
    await this.userRepository.update(id, user);
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async remove(id: number): Promise<DeleteResult> {
    // await this.userRepository.findOneOrFail(id);
    return await this.userRepository.delete(id);
  }
}
