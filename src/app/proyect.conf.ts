import { environment } from '../environments/environment';

export class AppSettings {
  public static backApi = `http://${environment.host}:${environment.port}/${environment.version}/`;
}
