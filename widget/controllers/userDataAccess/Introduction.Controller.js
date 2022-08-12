class IntroductionItem {
    constructor(data = {}) {
      this.description = data.description || "";
      this.images = data.images || [];
    }
}

const Introduction = {
  save: (introduction) => {
      return new Promise((resolve, reject) => {
          buildfire.datastore.save(introduction, "Introduction", function (err, result) {
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
        buildfire.datastore.get("Introduction", function (err, result) {
              if (err) {
                  reject(err);
              } else {
                  resolve(result);
              }
          });
      });
  }
};
  