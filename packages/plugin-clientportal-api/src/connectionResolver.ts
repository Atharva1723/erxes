import { ICPUserCardDocument } from './models/definitions/clientPortalUserCards';
import {
  ICPNotificationModel,
  loadNotificationClass
} from './models/ClientPortalNotifications';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import {
  IClientPortalModel,
  loadClientPortalClass
} from './models/ClientPortal';
import {
  IUserModel,
  loadClientPortalUserClass
} from './models/ClientPortalUser';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import { IUserDocument } from './models/definitions/clientPortalUser';
import { ICPNotificationDocument } from './models/definitions/clientPortalNotifications';
import {
  ICPUserCardModel,
  loadUserCardClass
} from './models/ClientPortalUserCard';
import { ICommentModel, loadCommentClass } from './models/Comment';
import { ICommentDocument } from './models/definitions/comment';
import { IFieldConfigModel, loadFieldConfigClass } from './models/FieldConfigs';
import { IFieldConfigDocument } from './models/definitions/fieldConfigs';
import {
  IClientCompanyModel,
  loadCompanyClass
} from './models/ClientPortalCompany';
import { IClientCompanyDocument } from './models/definitions/clientPortalCompany';

export interface IModels {
  ClientPortals: IClientPortalModel;
  ClientPortalUsers: IUserModel;
  ClientPortalNotifications: ICPNotificationModel;
  ClientPortalUserCards: ICPUserCardModel;
  Comments: ICommentModel;
  FieldConfigs: IFieldConfigModel;
  Companies: IClientCompanyModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser?: IUserDocument;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.ClientPortals = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models)
  );

  models.ClientPortalUsers = db.model<IUserDocument, IUserModel>(
    'client_portal_users',
    loadClientPortalUserClass(models)
  );

  models.ClientPortalUserCards = db.model<
    ICPUserCardDocument,
    ICPUserCardModel
  >('client_portal_user_cards', loadUserCardClass(models));

  models.ClientPortalNotifications = db.model<
    ICPNotificationDocument,
    ICPNotificationModel
  >('client_portal_notifications', loadNotificationClass(models));

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    'client_portal_comments',
    loadCommentClass(models)
  );

  models.FieldConfigs = db.model<IFieldConfigDocument, IFieldConfigModel>(
    'client_portal_field_configs',
    loadFieldConfigClass(models)
  );

  models.Companies = db.model<IClientCompanyDocument, IClientCompanyModel>(
    'client_portal_companies',
    loadCompanyClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
