import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

@Injectable()
export class SeedService {
  private isProd: boolean;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listsItemsRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly listsService: ListsService,
    private readonly listsItemsService: ListItemService,
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
    const user = await this.loadUsers();
    // ? Crear Items
    await this.loadItems(user);
    // ? Crear Listas
    const list = await this.loadLists(user);
    // ? Crear ListItems
    const items = await this.itemsService.findAll(
      user,
      { limit: 15, offset: 0 },
      {},
    );
    await this.loadListItems(list, items);

    return true;
  }

  async deleteDatabase() {
    // ? Borrar ListItems
    await this.listsItemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // ? Borrar Lists
    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

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

  async loadUsers(): Promise<User> {
    const users = [];
    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<void> {
    const itemPromises = [];
    for (const item of SEED_ITEMS) {
      itemPromises.push(this.itemsService.create(item, user));
    }

    await Promise.all(itemPromises);
  }

  async loadLists(user: User): Promise<List> {
    const lists = [];
    for (const list of SEED_LISTS) {
      lists.push(this.listsService.create(list, user));
    }

    return lists[0];
  }

  async loadListItems(list: List, items: Item[]) {
    for (const item of items) {
      this.listsItemsService.create({
        quantity: Math.round(Math.random() * 10),
        completed: Math.round(Math.random() * 1) === 0,
        listId: list.id,
        itemId: item.id,
      });
    }
  }
}
