import UserManager from "../managers/userManager";

export interface BaseMessageType {
  type: string;
}

export abstract class BaseMessageHandler {
  protected userManager: UserManager;
  constructor() {
    this.userManager = UserManager.getInstance();
  }
  abstract handle(payload: BaseMessageType, userId: number): Promise<void>;
}
