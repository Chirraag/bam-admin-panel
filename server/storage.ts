import { 
  users, 
  crmUsers, 
  columnMetadata, 
  clients,
  type User, 
  type InsertUser,
  type CrmUser,
  type InsertCrmUser,
  type ColumnMetadata,
  type InsertColumnMetadata,
  type Clients,
  type InsertClients
} from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // CRM User methods
  getCrmUsers(): Promise<CrmUser[]>;
  getCrmUserByEmail(email: string): Promise<CrmUser | undefined>;
  createCrmUser(user: InsertCrmUser): Promise<CrmUser>;
  updateCrmUser(id: string, user: Partial<InsertCrmUser>): Promise<CrmUser>;
  deleteCrmUser(id: string): Promise<void>;
  
  // Column metadata methods
  getColumnMetadata(): Promise<ColumnMetadata[]>;
  createColumnMetadata(metadata: InsertColumnMetadata): Promise<ColumnMetadata>;
  updateColumnMetadata(id: string, metadata: Partial<InsertColumnMetadata>): Promise<ColumnMetadata>;
  deleteColumnMetadata(id: string): Promise<void>;
  
  // Client methods
  getClients(): Promise<Clients[]>;
  createClient(client: InsertClients): Promise<Clients>;
  updateClient(id: string, client: Partial<InsertClients>): Promise<Clients>;
  deleteClient(id: string): Promise<void>;
  
  // Dynamic SQL execution
  executeSql(sql: string): Promise<void>;
  getTableSchema(tableName: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // CRM User methods
  async getCrmUsers(): Promise<CrmUser[]> {
    return await db.select().from(crmUsers);
  }

  async getCrmUserByEmail(email: string): Promise<CrmUser | undefined> {
    const [user] = await db.select().from(crmUsers).where(eq(crmUsers.email, email));
    return user || undefined;
  }

  async createCrmUser(user: InsertCrmUser): Promise<CrmUser> {
    const [newUser] = await db.insert(crmUsers).values(user).returning();
    return newUser;
  }

  async updateCrmUser(id: string, user: Partial<InsertCrmUser>): Promise<CrmUser> {
    const [updatedUser] = await db
      .update(crmUsers)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(crmUsers.id, id))
      .returning();
    return updatedUser;
  }

  async deleteCrmUser(id: string): Promise<void> {
    await db.delete(crmUsers).where(eq(crmUsers.id, id));
  }

  // Column metadata methods
  async getColumnMetadata(): Promise<ColumnMetadata[]> {
    return await db.select().from(columnMetadata);
  }

  async createColumnMetadata(metadata: InsertColumnMetadata): Promise<ColumnMetadata> {
    const [newMetadata] = await db.insert(columnMetadata).values(metadata).returning();
    return newMetadata;
  }

  async updateColumnMetadata(id: string, metadata: Partial<InsertColumnMetadata>): Promise<ColumnMetadata> {
    const [updatedMetadata] = await db
      .update(columnMetadata)
      .set(metadata)
      .where(eq(columnMetadata.id, id))
      .returning();
    return updatedMetadata;
  }

  async deleteColumnMetadata(id: string): Promise<void> {
    await db.delete(columnMetadata).where(eq(columnMetadata.id, id));
  }

  // Client methods
  async getClients(): Promise<Clients[]> {
    return await db.select().from(clients);
  }

  async createClient(client: InsertClients): Promise<Clients> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClients>): Promise<Clients> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Dynamic SQL execution
  async executeSql(sqlQuery: string): Promise<void> {
    await db.execute(sql.raw(sqlQuery));
  }

  async getTableSchema(tableName: string): Promise<any[]> {
    const result = await db.execute(sql.raw(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = '${tableName}' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `));
    return result.rows;
  }
}

export const storage = new DatabaseStorage();
