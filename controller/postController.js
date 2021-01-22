const Post = require('./../models/postModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const aws = require('aws-sdk');

const s3 = new aws.S3();

// AWS Config
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET,
    accessKeyId: process.env.AWS_ID,
    region: process.env.AWS_REGION
});


// routing functions 
exports.getAllPosts = catchAsync(async (req, res, next) => {
    
    const fileName = await Post.find({});

    if(!fileName) return next(new AppError('No images Found ! Upload Images! ',400));

    const fileNames = fileName.map( value => process.env.AWS_DATA_URL+value.name );
    
    return res.status(201).json({
        status: 'success',
        result: fileNames.length,
        data: fileNames
    })
});



exports.getAllMyPosts = catchAsync(async (req,res,next) => {

    const files = await Post.find({postedBy: req.params.username});

    if(!files) return next(new AppError('No Posts Found with that UserName !',400));

    const fileNames = files.map( value =>  process.env.AWS_DATA_URL+value.name );

    return res.status(201).json({
        status: 'success',
        results: fileNames.length,
        data: fileNames
    })
});



exports.uploadImage = catchAsync(async (req,res,next) => {

    console.log('req.file: ',req.file);

    if(!req.file) return next(new AppError('Something went wrong! we could not find your image, Please Upload again !',404));

    let arr = req.file.originalname.split('.');
    const extension = arr[arr.length-1];
    const imgType = extension;

    const imgName = Date.now().toString()+'.'+extension;


    let uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imgName,
        Body: req.file.buffer,
        ACL: 'public-read',
        Metadata: {
        dummy_value: 'Image'
        },
    }

    let image ;
    s3.upload(uploadParams, function(err, data) {
        if(err) return next(new AppError(`Something went wrong, Image not uploaded to AWS-S3: - ${err}`,410));
        image = data.Location;
        console.log("data: ",data);
    })

    

    const post = await Post.create({
        name: imgName,
        postedBy: req.params.username,
        imgType: imgType
    });
    post._v = undefined;

    const user = await User.findOne({username: req.params.username});
    
    if(!user) return next(new AppError('something went wrong!', 500));

    user.uploadLogs.push(Date.now());
    await user.save({ validateBeforeSave: false });

    return res.status(201).json({ 
        status: "success",        
        data: {
            image,
            post: post,
            uploadStatus: "success"
        }
    });
});




// ****************************************************************************************************************888
// exports.urlName = Date.now().toString();


// const multer = require('multer');

// const upload = multer({dest: ''});

// const S3 = new AWS.S3({
//    credentials: { 
//        accessKeyId: process.env.AWS_ID,
//         secretAccessKey: process.env.AWS_SECRET
//     }
// });


// const multer = require('multer');
// const multerS3 = require('multer-s3')
// let urlName = require('./../controller/postController');




// aws image name
// urlName = Date.now().toString();

// let uploadParams = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: process.env.AWS_ID,
//     Body: '',
//     ACL: 'public-read',
//     Metadata: {
//       dummy_value: 'Image'
//     }
// }

// s3.upload(uploadParams, function(err, data) {
//     console.log('Upload: ', data);
// }

