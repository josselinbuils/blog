import { Deferred } from '@josselinbuils/utils';

type Task<T extends any> = () => Promise<T>;

export class ExecQueue {
  private busy = false;
  private readonly queue: {
    deferred: Deferred<unknown>;
    task: Task<unknown>;
  }[] = [];

  async enqueue<T>(task: Task<T>): Promise<T> {
    const deferred = new Deferred<T>();

    if (!this.busy) {
      this.exec(task, deferred);
    } else {
      this.queue.push({ deferred, task });
    }
    return deferred.promise;
  }

  makeSync<T extends (...args: any) => any>(func: T): T {
    return ((...args) => this.enqueue(() => func(...args))) as T;
  }

  private async exec<T>(task: Task<T>, deferred: Deferred<T>): Promise<void> {
    this.busy = true;

    try {
      deferred.resolve(await task());
    } catch (error) {
      console.error(error.stack);
    }

    const nextEntry = this.queue.shift();

    if (nextEntry !== undefined) {
      await this.exec(nextEntry.task, nextEntry.deferred);
    } else {
      this.busy = false;
    }
  }
}
