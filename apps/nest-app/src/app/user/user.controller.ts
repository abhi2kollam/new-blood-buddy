import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';

@Controller('light-saber')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getAll() {
    return this.userService.getAll();
  }
  @Post()
  add(@Body() user: User) {
    return this.userService.add(user);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.get(parseInt(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() user: User) {
    return this.userService.update(parseInt(id), user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
