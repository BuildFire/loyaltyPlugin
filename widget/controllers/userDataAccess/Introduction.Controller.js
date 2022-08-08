class IntroductionItem {
    constructor(data = {}) {
      this.description = data.description || "";
      this.images = data.images || [];
    }
}

const Introduction = {
  TAG: "Introduction",
  save: (introduction) => {
      return new Promise((resolve, reject) => {
          buildfire.datastore.save(introduction, this.TAG, function (err, result) {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });
  },
  get: () => {
      return new Promise((resolve, reject) => {
        buildfire.datastore.get(this.TAG, function (err, result) {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });
  }
};
  