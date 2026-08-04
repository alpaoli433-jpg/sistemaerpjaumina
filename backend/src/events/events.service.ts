import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../shared/audit/audit.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const EVENT_INCLUDE = {
  drinks: { include: { recipe: true } },
  staff: { include: { staff: true } },
} as const;

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateEventDto, userId: string) {
    const { recipeIds, staffIds, eventDate, ...event } = dto;

    const created = await this.prisma.event.create({
      data: {
        ...event,
        eventDate: new Date(eventDate),
        drinks: recipeIds
          ? { create: recipeIds.map((recipeId) => ({ recipeId })) }
          : undefined,
        staff: staffIds
          ? { create: staffIds.map((staffId) => ({ staffId })) }
          : undefined,
      },
      include: EVENT_INCLUDE,
    });
    await this.audit.log({
      userId,
      action: 'CREATE_EVENT',
      entity: 'Event',
      details: `Creó el evento: ${created.title}.`,
    });
    return created;
  }

  findAll() {
    return this.prisma.event.findMany({
      include: EVENT_INCLUDE,
      orderBy: { eventDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDE,
    });
    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }
    return event;
  }

  async update(id: string, dto: UpdateEventDto, userId: string) {
    await this.findOne(id);
    const { recipeIds, staffIds, eventDate, ...event } = dto;

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...event,
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(recipeIds && {
          drinks: {
            deleteMany: {},
            create: recipeIds.map((recipeId) => ({ recipeId })),
          },
        }),
        ...(staffIds && {
          staff: {
            deleteMany: {},
            create: staffIds.map((staffId) => ({ staffId })),
          },
        }),
      },
      include: EVENT_INCLUDE,
    });
    await this.audit.log({
      userId,
      action: 'UPDATE_EVENT',
      entity: 'Event',
      details: `Actualizó el evento: ${updated.title}.`,
    });
    return updated;
  }

  async remove(id: string, userId: string) {
    const event = await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    await this.audit.log({
      userId,
      action: 'DELETE_EVENT',
      entity: 'Event',
      details: `Eliminó el evento: ${event.title}.`,
    });
    return { id };
  }
}
