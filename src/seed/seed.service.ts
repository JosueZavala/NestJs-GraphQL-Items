import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    this.isProd = configService.get('STATE') === 'prod';
  }

  async executeSeed() {
    // ? Validar que no estemos en Producción
    if (this.isProd) {
      throw new UnauthorizedException('We cannot run SEED on Prod environment');
    }

    // ? Limpiar la base de datos (Borrar todo)
    await this.deleteDatabase();
    // ? Crear Usuarios
    // ? Crear Items

    return true;
  }

  async deleteDatabase() {
    // ? Borrar Items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // ? Borrar Usuarios
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }
}
