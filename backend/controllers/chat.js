var Conversation = require('../models/conversation');
var Message = require('../models/message');
var User = require('../models/user');

exports.getConversations = function(req, res, next) {
    console.log('get conversations');
    var data = {};
    Conversation.find({participants : res.locals.userId})
        .select('_id project')
        .populate('project', 'name')
        .exec(function(err, conversations){
            if(err){
                res.status(500).json({err: true, message: err})
                return next(err);
            }
            console.log(conversations)
            let allConversations = []
            var promises = []
            console.log(conversations);
            conversations.forEach(function(conversation){
                var key = conversation._id;
                var value = conversation.project? conversation.project.name : "Nullity";
                data[key] = [value];
                promises.push(Message.find({ conversationId : conversation._id })
                    .sort({'createdAt': -1})
                    .limit(1)
                    .populate('sender', 'username')
                    .exec()
                );
            })
            Promise.all(promises).then(function(messages){
                messages.forEach( (ms) => {
                    var m = ms[0];
                    if (m && m.conversationId) {
                        console.log(data[m.conversationId]);
                        data[m.conversationId].push(m);
                    }
                })
                return res.status(200).json(data);
            }).catch(function(err){
                console.log(err);
                res.status(500).json({err: true, message: err});
            })
        })
}

exports.getConversation = function(req, res, next) {  
    Message.find({ conversationId: req.params.conversation_id })
        .select('createdAt body sender')
        .sort('-createdAt')
        .populate('sender','username')
        .exec(function(err, messages) {
            if (err) {
                res.status(500).json({err: true, message: err});
                return next(err);
            }
            res.status(200).json(messages);
        });
}

exports.newConversation = function(req, res, next) {
    console.log("add new conversation");
    if(!req.params.to) {
        res.status(422).json({ error: 'Need a valid recipient for your message.' });
        return next();
    }
    if(!req.body.content) {
        res.status(422).json({ error: 'Please enter a message.' });
        return next();
    }

    var conversationInfo = {
        participants: [res.locals.userId, req.params.to],
        project: req.body.projectId
    }

    var targetConversation;
    Conversation.findOne(conversationInfo).exec(function(err, conv){
        if (err){
            res.status(500).json({ error: true, message: err });
            return next(err);
        }
        console.log(conv);
        targetConversation = null
        if (!conv){
            const conversation = new Conversation(conversationInfo);
            conversation.save(function(err, newConversation) {
                if (err) {
                    return res.status(500).json({ error: true, message: err });
                }
                User.findByIdAndUpdate(res.locals.userId, {$addToSet: {conversations: newConversation._id}}, function(err){
                    if(err){
                        res.status(500).json({ error: true, message: err });
                    }
                })
                User.findByIdAndUpdate(req.params.to, {$addToSet: {conversations: newConversation._id}}, function(err){
                    if(err){
                        res.status(500).json({ error: true, message: err });
                    }
                })
                targetConversation = newConversation;
                createMessage(targetConversation);
            })
            
        }else{
            targetConversation = conv;
            createMessage(targetConversation);
        }
    })

    function createMessage(targetConversation) {
        console.log("create message");
        console.log(targetConversation);
        const message = new Message({
            conversationId: targetConversation._id,
            body: req.body.content,
            sender: res.locals.userId
        });
        message.save(function(err, newMessage) {
            if (err) {
                res.status(500).json({ error: true, message: err });
                return next(err);
            }
            res.status(200).json(newMessage);
            return next();
        });
    }
   
}

exports.newMessage = function(req, res, next){
    const reply = new Message({
        conversationId: req.body.conversationId,
        body: req.body.content,
        sender: res.locals.userId
    });

    reply.save(function(err, sentReply) {
        if (err) {
            res.status(500).json({ error: true, message: err });
            return next(err);
        }
        res.status(200).json(sentReply);
        return(next);
    });
}