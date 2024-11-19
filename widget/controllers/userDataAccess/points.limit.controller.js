const userDailyLimitTag = "userPointsLoyaltyLimit"
const getUserDailyPoints = (callback) =>{
    buildfire.userData.get(userDailyLimitTag,(err,r) =>{
        if(err) return callback(err);
        else return callback(null,r);
    });
}

const saveUserDailyPoints = (obj,callback) =>{
    buildfire.userData.save(obj,userDailyLimitTag,(err,r) =>{
        if(err) return callback(err);
        else return callback(null,r);
    })
}

const checkIfUserDailyLimitExceeded = (currentView, WidgetCode,purchaseOptionValue, callback) =>{
    if(currentView.amount > WidgetCode.application.dailyLimit) return callback({code:2103});
    getUserDailyPoints((err,r) =>{
        if(err) return callback(err);
        var pointsAwarded =null;
        if (purchaseOptionValue === 'perMoneySpent'){
            pointsAwarded = (currentView.amount * WidgetCode.application.pointsPerDollar) + WidgetCode.application.pointsPerVisit;
        }
        else {
            pointsAwarded = currentView.amount + WidgetCode.application.pointsPerVisit;
        }
        var date = new Date().toLocaleDateString();
        let pointsObj = new pointsLimit({
            pointsAwarded: pointsAwarded,
            pointsRedeemDate: date
        });
        if(Object.keys(r.data).length == 0){
            saveUserDailyPoints(pointsObj,(err,r) =>err ? callback(err) :  callback(null,r));
        }
        else{
            if((pointsAwarded + r.data.pointsAwarded > WidgetCode.application.dailyLimit) && r.data.pointsRedeemDate == date) return callback({code:2103});
            saveUserDailyPoints(pointsObj,(err,r) =>err ? callback(err) :  callback(null,r));
        }
    })
}
