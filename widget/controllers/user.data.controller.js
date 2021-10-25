var checkIfDailyLimitExceeded = function(currentView, WidgetCode, callback){
    if(currentView.amount > WidgetCode.application.dailyLimit) return callback({code:2103});
    else{
      buildfire.userData.get(`userPointsLoyalty`,(err,r) =>{
        if(err || Object.keys(r.data).length == 0){
          var pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
          let date = new Date();
          date = date.toLocaleDateString();
          buildfire.userData.save({dailyPointsAwarded:pointsAwarded,date:date},`userPointsLoyalty`,(err,r) => err?console.log(err):console.log(r));
          return callback(null, true);
        }
        else{
          let data = r.data;
          if(data.date === new Date().toLocaleDateString()){
            // check for daily limit
            var pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
            if(pointsAwarded + data.dailyPointsAwarded > WidgetCode.application.dailyLimit) return callback({code:2103});
            else{
              var pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
              let date = new Date();
              date = date.toLocaleDateString();
              buildfire.userData.save({dailyPointsAwarded:pointsAwarded+data.dailyPointsAwarded,date:date},`userPointsLoyalty`,(err,r) => err?console.log(err):console.log(r));
              return callback(null, true)
            }
          }
          else{
            var pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
            let date = new Date();
            date = date.toLocaleDateString();
            buildfire.userData.save({dailyPointsAwarded:pointsAwarded,date:date},`userPointsLoyalty`,(err,r) => err?console.log(err):console.log(r));
            return callback(null, true)
          }
        }
      })
    }
  }