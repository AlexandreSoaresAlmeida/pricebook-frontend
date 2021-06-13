import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';

@Injectable()
export class UserProvider {
  constructor(private storage: Storage, private datepipe: DatePipe) { }

  public insert(user: User) {
    let key = this.datepipe.transform(new Date(), "ddMMyyyyHHmmss");
    return this.save(key, user);
  }

  public update(key: string, user: User) {
    return this.save(key, user);
  }

  private save(key: string, user: User) {
    return this.storage.set(key, user);
  }

  public remove(key: string) {
    return this.storage.remove(key);
  }
}

export class User {
  email: string;
  lastAccess: Date;
}