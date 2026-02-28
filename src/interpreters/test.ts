class Ex {
  constructor(
    public message: string,
    public children = [] as Ex[],
  ) {}

  #compute = (): string => {
    const sep = ' ';
    const out =
      this.message + sep + this.children.map(c => c.#compute()).join('');
    return out;
  };

  compute = () => this.#compute();
}

const a = new Ex('Je', [
  new Ex('vais'),
  new Ex('manger', [new Ex('une'), new Ex('pomme')]),
]);

console.log(a.compute());
