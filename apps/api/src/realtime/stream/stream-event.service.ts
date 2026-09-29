import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StreamPayload } from '@nwis/types';

@Injectable()
export class StreamEventService {
  private readonly logger = new Logger(StreamEventService.name);
  private readonly eventSubject = new Subject<StreamPayload>();

  /**
   * Broadcast an event payload to all listening clients
   */
  broadcast(payload: StreamPayload): void {
    this.eventSubject.next(payload);
  }

  /**
   * Return an observable stream of events, optionally filtered by wellId
   */
  getStream(wellId?: string): Observable<StreamPayload> {
    if (!wellId) {
      return this.eventSubject.asObservable();
    }
    return this.eventSubject
      .asObservable()
      .pipe(filter((payload) => !payload.wellId || payload.wellId === wellId));
  }
}
