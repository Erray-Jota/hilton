import {
  users,
  projects,
  costBreakdowns,
  partners,
  partnerEvaluations,
  partnerContracts,
  designDocuments,
  materialSpecifications,
  doorSchedule,
  designWorkflows,
  engineeringDetails,
  unitLayouts,
  commonAreaConfigs,
  stairModules,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type CostBreakdown,
  type InsertCostBreakdown,
  type Partner,
  type InsertPartner,
  type PartnerEvaluation,
  type InsertPartnerEvaluation,
  type PartnerContract,
  type InsertPartnerContract,
  type DesignDocument,
  type InsertDesignDocument,
  type MaterialSpecification,
  type InsertMaterialSpecification,
  type DoorScheduleItem,
  type InsertDoorScheduleItem,
  type DesignWorkflow,
  type InsertDesignWorkflow,
  type EngineeringDetail,
  type InsertEngineeringDetail,
  type UnitLayout,
  type InsertUnitLayout,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Project operations
  getAllProjects(): Promise<Project[]>;
  getUserProjects(userId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject & { userId: string }): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Cost breakdown operations
  getProjectCostBreakdowns(projectId: string): Promise<CostBreakdown[]>;
  createCostBreakdown(breakdown: InsertCostBreakdown): Promise<CostBreakdown>;
  updateCostBreakdown(id: string, breakdown: Partial<InsertCostBreakdown>): Promise<CostBreakdown>;

  // Partner operations
  getAllPartners(): Promise<Partner[]>;
  getPartnersByType(type: string): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  getPartnerEvaluations(projectId: string): Promise<PartnerEvaluation[]>;
  createPartnerEvaluation(evaluation: InsertPartnerEvaluation): Promise<PartnerEvaluation>;
  getPartnerContracts(projectId: string): Promise<PartnerContract[]>;
  createPartnerContract(contract: InsertPartnerContract): Promise<PartnerContract>;

  // EasyDesign operations
  getDesignDocuments(projectId: string): Promise<DesignDocument[]>;
  createDesignDocument(document: InsertDesignDocument): Promise<DesignDocument>;
  getMaterialSpecifications(projectId: string): Promise<MaterialSpecification[]>;
  createMaterialSpecification(spec: InsertMaterialSpecification): Promise<MaterialSpecification>;
  getDoorSchedule(projectId: string): Promise<DoorScheduleItem[]>;
  createDoorScheduleItem(item: InsertDoorScheduleItem): Promise<DoorScheduleItem>;
  getDesignWorkflows(projectId: string): Promise<DesignWorkflow[]>;
  createDesignWorkflow(workflow: InsertDesignWorkflow): Promise<DesignWorkflow>;
  getEngineeringDetails(projectId: string): Promise<EngineeringDetail[]>;
  createEngineeringDetail(detail: InsertEngineeringDetail): Promise<EngineeringDetail>;

  // Unit layout operations
  seedUnitLayouts(): Promise<number>;
  getUnitLayouts(): Promise<UnitLayout[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async getAllProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .orderBy(desc(projects.updatedAt));
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.updatedAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject & { userId: string }): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: string): Promise<void> {
    // Delete related records first due to foreign key constraints
    await db.delete(costBreakdowns).where(eq(costBreakdowns.projectId, id));
    // Then delete the project
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Cost breakdown operations - Now reads from unified JSON structure
  async getProjectCostBreakdowns(projectId: string): Promise<CostBreakdown[]> {
    // Get project with costAnalysis data
    const [project] = await db
      .select({ costAnalysis: projects.costAnalysis })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project?.costAnalysis?.masterFormatBreakdown) {
      // Fallback to legacy costBreakdowns table for backward compatibility
      return await db
        .select()
        .from(costBreakdowns)
        .where(eq(costBreakdowns.projectId, projectId));
    }

    // Transform unified data back to legacy CostBreakdown format for API compatibility
    return project.costAnalysis.masterFormatBreakdown.map((item: any, index: number) => ({
      id: `${projectId}::${index}`, // Use :: delimiter to avoid UUID conflicts
      projectId,
      category: item.category,
      siteBuiltCost: item.siteBuiltCost?.toString() || null,
      raapGcCost: item.modularGcCost?.toString() || null,
      raapFabCost: item.modularFabCost?.toString() || null,
      raapTotalCost: item.modularTotalCost?.toString() || null
    }));
  }

  async createCostBreakdown(breakdown: InsertCostBreakdown): Promise<CostBreakdown> {
    // Get current project costAnalysis
    const [project] = await db
      .select({ costAnalysis: projects.costAnalysis })
      .from(projects)
      .where(eq(projects.id, breakdown.projectId));

    // Initialize costAnalysis if it doesn't exist
    const currentCostAnalysis = project?.costAnalysis || {
      masterFormatBreakdown: [],
      detailedMetrics: {
        modularConstruction: { designPhaseMonths: 0, fabricationMonths: 0, siteWorkMonths: 0 },
        siteBuiltConstruction: { designPhaseMonths: 0, constructionMonths: 0 },
        comparison: { costSavingsAmount: 0, timeSavingsMonths: 0, timeSavingsPercent: 0 }
      },
      pricingValidation: { isComplete: false, validatedBy: "", validatedAt: "", notes: "" }
    };

    // Add new breakdown to masterFormatBreakdown array
    const newBreakdownItem = {
      category: breakdown.category,
      categoryCode: breakdown.category.split(' - ')[0] || breakdown.category,
      siteBuiltCost: parseFloat(breakdown.siteBuiltCost || "0"),
      modularGcCost: parseFloat(breakdown.raapGcCost || "0"),
      modularFabCost: parseFloat(breakdown.raapFabCost || "0"),
      modularTotalCost: parseFloat(breakdown.raapTotalCost || "0"),
      modularCostPerSf: 0
    };

    currentCostAnalysis.masterFormatBreakdown.push(newBreakdownItem);

    // Update project with new costAnalysis
    await db
      .update(projects)
      .set({ costAnalysis: currentCostAnalysis })
      .where(eq(projects.id, breakdown.projectId));

    // Return in legacy format for API compatibility
    return {
      id: `${breakdown.projectId}::${currentCostAnalysis.masterFormatBreakdown.length - 1}`,
      projectId: breakdown.projectId,
      category: breakdown.category,
      siteBuiltCost: breakdown.siteBuiltCost || null,
      raapGcCost: breakdown.raapGcCost || null,
      raapFabCost: breakdown.raapFabCost || null,
      raapTotalCost: breakdown.raapTotalCost || null
    };
  }

  async updateCostBreakdown(id: string, breakdown: Partial<InsertCostBreakdown>): Promise<CostBreakdown> {
    // Extract projectId and index from composite ID (format: projectId::index)
    const lastDelimiter = id.lastIndexOf('::');
    if (lastDelimiter === -1) {
      throw new Error(`Invalid cost breakdown ID format: ${id}. Expected format: projectId::index`);
    }

    const projectId = id.substring(0, lastDelimiter);
    const indexStr = id.substring(lastDelimiter + 2);
    const index = parseInt(indexStr);

    if (!projectId || isNaN(index)) {
      throw new Error(`Invalid cost breakdown ID format: ${id}. ProjectId: '${projectId}', Index: '${indexStr}'`);
    }

    // Get current project costAnalysis
    const [project] = await db
      .select({ costAnalysis: projects.costAnalysis })
      .from(projects)
      .where(eq(projects.id, projectId));

    if (!project?.costAnalysis?.masterFormatBreakdown?.[index]) {
      throw new Error(`Cost breakdown not found at index ${index} for project ${projectId}`);
    }

    // Update the specific breakdown item
    const updatedBreakdown = {
      ...project.costAnalysis.masterFormatBreakdown[index],
      ...(breakdown.category && { category: breakdown.category }),
      ...(breakdown.category && { categoryCode: breakdown.category.split(' - ')[0] || breakdown.category }),
      ...(breakdown.siteBuiltCost && { siteBuiltCost: parseFloat(breakdown.siteBuiltCost) }),
      ...(breakdown.raapGcCost && { modularGcCost: parseFloat(breakdown.raapGcCost) }),
      ...(breakdown.raapFabCost && { modularFabCost: parseFloat(breakdown.raapFabCost) }),
      ...(breakdown.raapTotalCost && { modularTotalCost: parseFloat(breakdown.raapTotalCost) })
    };

    // Update the array
    project.costAnalysis.masterFormatBreakdown[index] = updatedBreakdown;

    // Save updated costAnalysis back to database
    await db
      .update(projects)
      .set({ costAnalysis: project.costAnalysis })
      .where(eq(projects.id, projectId));

    // Return in legacy format for API compatibility
    return {
      id,
      projectId,
      category: updatedBreakdown.category,
      siteBuiltCost: updatedBreakdown.siteBuiltCost?.toString() || null,
      raapGcCost: updatedBreakdown.modularGcCost?.toString() || null,
      raapFabCost: updatedBreakdown.modularFabCost?.toString() || null,
      raapTotalCost: updatedBreakdown.modularTotalCost?.toString() || null
    };
  }

  // Partner operations
  async getAllPartners(): Promise<Partner[]> {
    return await db
      .select()
      .from(partners)
      .where(eq(partners.isActive, true))
      .orderBy(partners.name);
  }

  async getPartnersByType(type: string): Promise<Partner[]> {
    return await db
      .select()
      .from(partners)
      .where(eq(partners.partnerType, type) && eq(partners.isActive, true))
      .orderBy(partners.name);
  }

  async createPartner(partnerData: InsertPartner): Promise<Partner> {
    const [newPartner] = await db
      .insert(partners)
      .values(partnerData)
      .returning();
    return newPartner;
  }

  async getPartnerEvaluations(projectId: string): Promise<PartnerEvaluation[]> {
    return await db
      .select()
      .from(partnerEvaluations)
      .where(eq(partnerEvaluations.projectId, projectId))
      .orderBy(desc(partnerEvaluations.evaluatedAt));
  }

  async createPartnerEvaluation(evaluation: InsertPartnerEvaluation): Promise<PartnerEvaluation> {
    const [newEvaluation] = await db
      .insert(partnerEvaluations)
      .values(evaluation)
      .returning();
    return newEvaluation;
  }

  async getPartnerContracts(projectId: string): Promise<PartnerContract[]> {
    return await db
      .select()
      .from(partnerContracts)
      .where(eq(partnerContracts.projectId, projectId))
      .orderBy(desc(partnerContracts.updatedAt));
  }

  async createPartnerContract(contract: InsertPartnerContract): Promise<PartnerContract> {
    const [newContract] = await db
      .insert(partnerContracts)
      .values(contract)
      .returning();
    return newContract;
  }

  // EasyDesign operations
  async getDesignDocuments(projectId: string): Promise<DesignDocument[]> {
    return await db
      .select()
      .from(designDocuments)
      .where(eq(designDocuments.projectId, projectId))
      .orderBy(desc(designDocuments.createdAt));
  }

  async createDesignDocument(documentData: InsertDesignDocument): Promise<DesignDocument> {
    const [newDocument] = await db
      .insert(designDocuments)
      .values(documentData)
      .returning();
    return newDocument;
  }

  async getMaterialSpecifications(projectId: string): Promise<MaterialSpecification[]> {
    return await db
      .select()
      .from(materialSpecifications)
      .where(eq(materialSpecifications.projectId, projectId))
      .orderBy(materialSpecifications.roomType, materialSpecifications.materialCategory);
  }

  async createMaterialSpecification(specData: InsertMaterialSpecification): Promise<MaterialSpecification> {
    const [newSpec] = await db
      .insert(materialSpecifications)
      .values(specData)
      .returning();
    return newSpec;
  }

  async getDoorSchedule(projectId: string): Promise<DoorScheduleItem[]> {
    return await db
      .select()
      .from(doorSchedule)
      .where(eq(doorSchedule.projectId, projectId))
      .orderBy(doorSchedule.doorNumber);
  }

  async createDoorScheduleItem(itemData: InsertDoorScheduleItem): Promise<DoorScheduleItem> {
    const [newItem] = await db
      .insert(doorSchedule)
      .values(itemData)
      .returning();
    return newItem;
  }

  async getDesignWorkflows(projectId: string): Promise<DesignWorkflow[]> {
    return await db
      .select()
      .from(designWorkflows)
      .where(eq(designWorkflows.projectId, projectId))
      .orderBy(designWorkflows.dueDate, designWorkflows.priority);
  }

  async createDesignWorkflow(workflowData: InsertDesignWorkflow): Promise<DesignWorkflow> {
    const [newWorkflow] = await db
      .insert(designWorkflows)
      .values(workflowData)
      .returning();
    return newWorkflow;
  }

  async getEngineeringDetails(projectId: string): Promise<EngineeringDetail[]> {
    return await db
      .select()
      .from(engineeringDetails)
      .where(eq(engineeringDetails.projectId, projectId))
      .orderBy(engineeringDetails.system, engineeringDetails.detailType);
  }

  async createEngineeringDetail(detailData: InsertEngineeringDetail): Promise<EngineeringDetail> {
    const [newDetail] = await db
      .insert(engineeringDetails)
      .values(detailData)
      .returning();
    return newDetail;
  }

  // Unit layout operations
  async seedUnitLayouts(): Promise<number> {
    // Define the 5 unit types based on provided floor plans
    const unitLayoutData: InsertUnitLayout[] = [
      {
        unitType: 'STUDIO',
        displayName: 'Studio',
        numBays: 1,
        widthInches: 186, // 15'6"
        depthInches: 336, // 28'
        areaSquareFeet: 430,
        bayWidthInches: 186, // 15'6"
        isCornerUnit: false,
        description: 'Compact studio unit with efficient layout',
      },
      {
        unitType: '1BDJR',
        displayName: 'Jr. 1-Bed',
        numBays: 1,
        widthInches: 187, // 15'7"
        depthInches: 336, // 28'
        areaSquareFeet: 435,
        bayWidthInches: 187, // 15'7"
        isCornerUnit: false,
        description: 'Junior one-bedroom unit optimized for narrow building footprints',
      },
      {
        unitType: '1BD',
        displayName: '1-Bed',
        numBays: 2,
        widthInches: 324, // 27'
        depthInches: 336, // 28'
        areaSquareFeet: 750,
        bayWidthInches: 162, // 13'6"
        isCornerUnit: false,
        description: 'Standard one-bedroom unit with full living and dining areas',
      },
      {
        unitType: '2BDA',
        displayName: '2-Bed Type A (Corner)',
        numBays: 2,
        widthInches: 336, // 28'
        depthInches: 336, // 28'
        areaSquareFeet: 780,
        bayWidthInches: 168, // 14'
        isCornerUnit: true,
        description: 'Two-bedroom corner unit with wraparound layout',
      },
      {
        unitType: '2BDB',
        displayName: '2-Bed Type B',
        numBays: 3,
        widthInches: 480, // 40'
        depthInches: 336, // 28'
        areaSquareFeet: 1120,
        bayWidthInches: 160, // 13'4"
        isCornerUnit: false,
        description: 'Spacious two-bedroom unit with three-bay configuration',
      },
    ];

    // Insert unit layouts (delete existing first to allow re-seeding)
    await db.delete(unitLayouts);
    const insertedUnits = await db.insert(unitLayouts).values(unitLayoutData).returning();

    // Seed common area configurations
    await db.delete(commonAreaConfigs);
    await db.insert(commonAreaConfigs).values([
      {
        configType: '1-bay',
        numBays: 1,
        displayName: '1-Bay Common Area',
        description: 'Single bay common area (lobby, mailroom, etc.)',
      },
      {
        configType: '2-bay',
        numBays: 2,
        displayName: '2-Bay Common Area',
        description: 'Two-bay common area for larger amenity spaces',
      },
      {
        configType: '4-bay',
        numBays: 4,
        displayName: '4-Bay Common Area',
        description: 'Four-bay common area for major amenities (gym, lounge, etc.)',
      },
    ]);

    // Seed stair module
    await db.delete(stairModules);
    await db.insert(stairModules).values([
      {
        moduleType: 'standard',
        widthInches: 120, // 10' typical stair width
        depthInches: 168, // 14' typical depth
        description: 'Standard egress stair module',
      },
    ]);

    return insertedUnits.length;
  }

  async getUnitLayouts(): Promise<UnitLayout[]> {
    return await db.select().from(unitLayouts);
  }
}


export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();

  async getUser(id: string): Promise<User | undefined> { return this.users.get(id); }
  async upsertUser(user: UpsertUser): Promise<User> {
    const u = { ...user, id: user.id || "default", createdAt: new Date(), updatedAt: new Date() } as User;
    this.users.set(u.id, u);
    return u;
  }
  async getAllProjects(): Promise<Project[]> { return Array.from(this.projects.values()); }
  async getUserProjects(userId: string): Promise<Project[]> { return Array.from(this.projects.values()).filter(p => p.userId === userId); }
  async getProject(id: string): Promise<Project | undefined> { return this.projects.get(id); }
  async createProject(project: InsertProject & { userId: string }): Promise<Project> {
    const id = Math.random().toString(36).substr(2, 9);
    const p = { ...project, id, createdAt: new Date(), updatedAt: new Date() } as Project;
    this.projects.set(id, p);
    return p;
  }
  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) throw new Error("Not found");
    const updated = { ...existing, ...project, updatedAt: new Date() } as Project;
    this.projects.set(id, updated);
    return updated;
  }
  async deleteProject(id: string): Promise<void> { this.projects.delete(id); }

  // Stubs for others
  async getProjectCostBreakdowns(projectId: string): Promise<CostBreakdown[]> { return []; }
  async createCostBreakdown(breakdown: InsertCostBreakdown): Promise<CostBreakdown> { throw new Error("Not implemented in memory"); }
  async updateCostBreakdown(id: string, breakdown: Partial<InsertCostBreakdown>): Promise<CostBreakdown> { throw new Error("Not implemented"); }

  async getAllPartners(): Promise<Partner[]> { return []; }
  async getPartnersByType(type: string): Promise<Partner[]> { return []; }
  async createPartner(partner: InsertPartner): Promise<Partner> { throw new Error("Not implemented"); }

  async getPartnerEvaluations(projectId: string): Promise<PartnerEvaluation[]> { return []; }
  async createPartnerEvaluation(eval_: InsertPartnerEvaluation): Promise<PartnerEvaluation> { throw new Error("Not implemented"); }
  async getPartnerContracts(projectId: string): Promise<PartnerContract[]> { return []; }
  async createPartnerContract(contract: InsertPartnerContract): Promise<PartnerContract> { throw new Error("Not implemented"); }

  async getDesignDocuments(projectId: string): Promise<DesignDocument[]> { return []; }
  async createDesignDocument(doc: InsertDesignDocument): Promise<DesignDocument> { throw new Error("Not implemented"); }
  async getMaterialSpecifications(projectId: string): Promise<MaterialSpecification[]> { return []; }
  async createMaterialSpecification(spec: InsertMaterialSpecification): Promise<MaterialSpecification> { throw new Error("Not implemented"); }
  async getDoorSchedule(projectId: string): Promise<DoorScheduleItem[]> { return []; }
  async createDoorScheduleItem(item: InsertDoorScheduleItem): Promise<DoorScheduleItem> { throw new Error("Not implemented"); }
  async getDesignWorkflows(projectId: string): Promise<DesignWorkflow[]> { return []; }
  async createDesignWorkflow(wf: InsertDesignWorkflow): Promise<DesignWorkflow> { throw new Error("Not implemented"); }
  async getEngineeringDetails(projectId: string): Promise<EngineeringDetail[]> { return []; }
  async createEngineeringDetail(detail: InsertEngineeringDetail): Promise<EngineeringDetail> { throw new Error("Not implemented"); }

  async seedUnitLayouts(): Promise<number> { return 0; }
  async getUnitLayouts(): Promise<UnitLayout[]> { return []; }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
