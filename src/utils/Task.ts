export type TaskFn = () => Promise<void>;

export class SimpleScheduler {
  private queue: TaskFn[] = [];
  private running = 0;

  constructor(
    private readonly maxConcurrency: number = 5
  ) {
  }

  public add(task: TaskFn): void {
    this.queue.push(task);
  }

  public tryRunNext(): void {
    if (this.running >= this.maxConcurrency) return;

    const task = this.queue.shift();
    if (!task) return;

    this.running++;

    task()
      .finally(() => {
        this.running--;
        this.tryRunNext();
      })
  }
}
