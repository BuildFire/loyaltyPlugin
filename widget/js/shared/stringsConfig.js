const stringsConfig = {
    general: {
		title: "General"
		, subtitle: "General strings through feature"
		, labels: {
            loginOrRegister: {
				title: "Login or Register"
				, placeholder: "Login or Register"
				, maxLength: 25
                , defaultValue: "Login or Register"
				, defaultValue: "Login or Register"
            },
            toGetPoints: {
				title: "To Get Points"
				, placeholder: "to get points"
				, maxLength: 20
                , defaultValue: "to get points"
				, defaultValue: "to get points"
            },
			points: {
				title: "Points"
				, placeholder: "Points"
				, maxLength: 10
                , defaultValue: "Points"
				, defaultValue: "Points"
            },
            currentlyHave: {
                title: "You currently have"
                , placeholder: "You currently have"
                , maxLength: 25
				, defaultValue: "You currently have"
            },
            getMore: {
                title: "Get More Points"
                , placeholder: "Get More Points"
                , maxLength: 20
				, defaultValue: "Get More Points"
            },
            redeem: {
                title: "Redeem"
                , placeholder: "Redeem"
                , maxLength: 25
				, defaultValue: "Redeem"
            },
            done: {
                title: "Done"
                , placeholder: "Done"
                , maxLength: 10
				, defaultValue: "Done"
            },
            cancel: {
                title: "Cancel"
                , placeholder: "Cancel"
                , maxLength: 10
				, defaultValue: "Cancel"
            },
            confirm: {
                title: 'Confirm'
                , placeholder: "Confirm"
                , maxLength: 10
				, defaultValue: "Confirm"
            },
            next: {
                title: 'Next'
                , placeholder: "Next"
                , maxLength: 10
				, defaultValue: "Next"
            },
        },
    },
    redeem: {
            title: "Redeem"
            , subtitle: "Strings in Redeem"
            , 
            labels: [
                {
                    title: "Confirm Redemption Modal",
                    subLabels: {
                        titleNote: {
                            title: "Title"
                            , placeholder: "Redeem Item"
                            , maxLength: 30
                            , defaultValue: "Redeem Item"
                        },
        
                        importantNote: {
                            title: "Body"
                            , placeholder: "By clicking redeem, you are confirming that the reward has been received and the coresponding points will, therefore, be deducted from your account."
                            , maxLength: 200
                            , defaultValue: "By clicking redeem, you are confirming that the reward has been received and the coresponding points will, therefore, be deducted from your account."
                        },
        
                        cancelActionNote: {
                            title: "Cancel action link"
                            , placeholder: "CANCEL"
                            , maxLength: 20
                            , defaultValue: "CANCEL"
                        },
        
                        confirmActionNote: {
                            title: "Confirm action link"
                            , placeholder: "REDEEM"
                            , maxLength: 20
                            , defaultValue: "REDEEM"
                        },
                    }
                },
                {
                    title: "Item Redeemed Modal",
                    subLabels: {
                        itemRedeemedTitle: {
                            title: 'Title'
                            , placeholder: "Item Redeemed"
                            , maxLength: 60
                            , defaultValue: 'Item Redeemed'
                        },
                        itemRedeemedBody: {
                            title: 'Body'
                            , placeholder: "Rewards can take up to 24 hours to process. You can check the status of your reward by tapping on rewards icon in the upper right corner on the home screen."
                            , maxLength: 200
                            , defaultValue: 'Rewards can take up to 24 hours to process. You can check the status of your reward by tapping on rewards icon in the upper right corner on the home screen.'
                        },
                        closeitemRedeemedAction: {
                            title: 'Close modal action link'
                            , placeholder: "Thanks"
                            , maxLength: 50
                            , defaultValue: 'Thanks'
                        },

                       
                    }
                },
                {
                    title: "Error Messages",
                    subLabels: {
                        errorRedeem: {
                            title: 'Redeem Error'
                            , placeholder: "Redeem Error"
                            , maxLength: 60
                            , defaultValue: 'Error redeeming reward. Please try again later.'
                        },
                        redeemDailyLimit: {
                            title: 'Exceeded Daily Limit Message'
                            , placeholder: "You have exceeded the daily limit."
                            , maxLength: 60
                            , defaultValue: 'You have exceeded the daily limit.'
                        }, 
                        insufficientFunds: {
                            title: "Insufficient Funds"
                            , placeholder: "You have insufficient points. Please get points to redeem awards."
                            , maxLength: 80
                            , defaultValue: "You have insufficient points. Please get points to redeem awards."
                        },
                    }
                },
                
            ],
         },
    buyItems: {
        title: 'Buy Items'
        , subtitle: "Strings in Buy Items",
        labels: {
            productName: {
                title: "Product Name"
                , placeholder: "Product Name"
                , maxLength: 20
                , defaultValue: "Product Name"
            },
            pointsPerProduct: {
                title: "Points Per Product"
                , placeholder: "Points Per Product"
                , maxLength: 25
                , defaultValue: "Points Per Product"
            },
            quantity: {
                title: "Quantity"
                , placeholder: "Quantity"
                , maxLength: 10
                , defaultValue: "Quantity"
            },
            totalPoints: {
                title: "Total Points"
                , placeholder: "Total Points"
                , maxLength: 30
                , defaultValue: "Total Points"
            }
        }
    },
    awarded: {
        title: 'Success - Earned Points'
        , subtitle: "Strings in Awarded",
        labels: {
            awesome: {
                title: "Awesome!"
                , placeholder: "Awesome!"
                , maxLength: 15
                , defaultValue: "Awesome!"
            },
            justEarned: {
                title: "You just earned yourself"
                , placeholder: "You just earned yourself"
                , maxLength: 30
                , defaultValue: "You just earned yourself"
            },
            checkList: {
                title: "Check out our list of rewards to redeem."
                , placeholder: "Check out our list of rewards to redeem."
                , maxLength: 50
                , defaultValue: "Check out our list of rewards to redeem."
            },
            totalPoints: {
                title: "Total Points"
                , placeholder: "Total Points"
                , maxLength: 30
                , defaultValue: "Total Points"
            }
        }
    },
    amount: {
        title: 'Enter Money Spent'
        , subtitle: "Strings in Amount",
        labels: {
            enterAmount: {
                title: "Enter Purchase Amount"
                , placeholder: "Enter the Purchase Amount"
                , maxLength: 35
                , defaultValue: "Enter the Purchase Amount"
            },
            
        }
    },
    deeplink: {
      title: "Deep link",
      labels: {
        deeplinkRewardNotFound: {
          title: "Deep link to reward that does not exist",
          placeholder: "Reward does not exist!",
          maxLength: 50,
          defaultValue: "Reward does not exist!",
        },
      },
    },
    staffApproval: {
        title: 'Staff Approval'
        , subtitle: "",
        labels: [
        {   title: "",
            subLabels: {
                approve: {
                    title: "Approve"
                    , placeholder: "Approve"
                    , maxLength: 20
                    , defaultValue: "Approve"
                },
                deny: {
                    title: "Deny"
                    , placeholder: "Deny"
                    , maxLength: 20
                    , defaultValue: "Deny"
                },
            }
        },
        {
            title: "Staff On-Site Confirmation",
            subLabels: {
                handDevice: {
                    title: 'Hand Device Message'
                    , placeholder: "Please hand your device to a staff member for confirmation"
                    , maxLength: 70
                    , defaultValue: "Please hand your device to a staff member for confirmation"
                },
                invalidCode: {
                    title: 'Invalid Confirmation Code'
                    , placeholder: "Invalid confirmation code."
                    , maxLength: 40
                    , defaultValue: "Invalid confirmation code."
                },
                enterCode: {
                    title: "Enter Code"
                    , placeholder: "Enter Code"
                    , maxLength: 30
                    , defaultValue: "Enter Code"
                }
            }
        }

          
            
        ]
    },
	};
