import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user-module';

import { ServeStaticModule } from '@nestjs/serve-static'; // <- INSERT LINE
import { join } from 'path'; // <- INSERT LINE

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   host: '34.93.76.21/blood-bank-392508:asia-south1:blood-bank',
    //   port: 5432,
    //   username: 'postgres',
    //   password: `&l},6DSx@&';aZ2y`,
    //   database: 'blood-bank',
    //   entities: [join(__dirname, '**/**.entity{.ts,.js}')],
    //   synchronize: true,
    // }),
    // UserModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'angular-app'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
