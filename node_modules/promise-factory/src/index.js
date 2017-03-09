export class PromiseFactory {
  static all(arr) {
    return Promise.all(arr);
  }

  static create(fun) {
    return new Promise(fun);
  }

  static createFromNode(fun) {
    return new Promise((resolve, reject) => {
      fun((err, data) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      });
    });
  }
}
