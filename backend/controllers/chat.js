var Conversation = require('../models/conversation');
var Message = require('../models/message');
var User = require('../models/user');

exports.getConversations = function(req, res, next) {
    Conversation.find({participants : res.locals.userId})
        .select('_id')
        .exec(function(err, conversations){
            if(err){
                res.status(500).json({err: true, message: err})
                return next(err);
            }
            let allConversations = []
            conversations.forEach(function(conversation){
                Message.find({ conversationId : conversation._id })
                    .sort('-createdAt')
                    .limit(1)
                    .populate('sender', 'username')
                    .exec(function(err, message){
                        if (err) {
                            res.status(500).json({err: true, message: err});
                            return next(err);
                        }
                        allConversations.push(message);
                    })
            })
            return res.status(200).json(allConversations)
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
    if(!req.params.to) {
        res.status(422).json({ error: 'Need a valid recipient for your message.' });
        return next();
    }
    if(!req.body.content) {
        res.status(422).json({ error: 'Please enter a message.' });
        return next();
    }
    conversationInfo = {
        participants: [res.locals.userId, req.params.to],
        project: req.body.projectId
    }
    conversation.findOne(conversationInfo).exec(function(err, conv){
        if (err){
            res.status(500).json({ error: true, message: err });
            return next(err);
        }
        var targetConversation = null
        if (!conv){
            const conversation = new Conversation(conversationInfo);
            conversation.save(function(err, newConversation) {
                if (err) {
                    res.status(500).json({ error: true, message: err });
                    return next(err);
                }
                targetConversation = newConversation;
            })
        }else{
            targetConversation = conv;
        }
    })
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