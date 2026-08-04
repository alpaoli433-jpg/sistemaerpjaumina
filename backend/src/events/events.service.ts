import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const EVENT_INCLUDE = {
  drinks: { include: { recipe: true } },
  staff: { include: { staff: true } },
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateEventDto) {
    const { recipeIds, staffIds, eventDate, ...event } = dto;

    return this.prisma.event.create({
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

  async update(id: string, dto: UpdateEventDto) {
    await this.findOne(id);
    const { recipeIds, staffIds, eventDate, ...event } = dto;

    return this.prisma.event.update({
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
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
