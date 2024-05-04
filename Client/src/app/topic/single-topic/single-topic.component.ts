import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogApiService } from '../../services/blog-api.service';
import { UserStoreService } from '../../services/user-store.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-single-topic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [DatePipe],
  templateUrl: './single-topic.component.html',
  styleUrl: './single-topic.component.css'
})
export class SingleTopicComponent implements OnInit{
  
  userId:any = [];
  topicId!: number;
  topic: any = {};
  commentList$: Observable<any[]> | undefined  
  commentListLength: number = 0; 
  newcomment: any;   
  commentInputText: string = '';
  formattedDate!: string | null;
  isChecked: boolean | undefined;
  

  constructor(private route: ActivatedRoute, private apiservice: BlogApiService, private userstoreservice: UserStoreService, private authservice: AuthService, private snackBar: MatSnackBar, private datePipe: DatePipe) {
    const currentDate = new Date();
    this.formattedDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd HH:mm');
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      this.topicId = params['id'];           
      
    });       

    this.userstoreservice.getUserIdFromStore()
      .subscribe(val=>{
        let userIdFromToken = this.authservice.getUserIdFromToken();
        this.userId = val || userIdFromToken
    })

    this.apiservice.getFavTopicList() // Feltehetően ez a függvény lekéri az összes kedvenc témát
  .pipe(
    catchError(error => {
      console.error('Error retrieving favorite topics: ', error);
      return EMPTY;
    })
  )
  .subscribe(topics => {
    
    const foundTopic = topics.find(topic => topic.userId == this.userId && topic.topicId == this.topicId);
    
    this.isChecked = !!foundTopic;
  });

    this.loadTopic();  
    this.getComments();  
    
  }

  onCheckboxChange(): void {
  
    if (this.isChecked) {

      var data = {
        "userId": this.userId,
        "topicId": this.topicId
      }

      this.apiservice.addFavTopic(data).subscribe(response => {
        this.openSnackBar(`${this.topic.name} successfully added to favourite topics`);
      }, error => {
        this.openSnackBar('Something went wrong: '+ error);
      });
    } else {

      this.apiservice.deleteFavTopic(this.userId, this.topicId).subscribe(response => {
        this.openSnackBar(`${this.topic.name} successfully deleted from favourite topics`);
      }, error => {
        this.openSnackBar('Something went wrong: '+ error);
      });
    }
  }

  //this function loads the clicked topic
  loadTopic() {
    this.apiservice.getTopic(this.topicId).subscribe(details => {
      this.topic = details;
    });    
  }

  //this function gets the list of all comments, and filters it to the current topic
  getComments(): void {    
    this.apiservice.getCommentList().pipe(
      map(comments => comments.filter(comment => comment.topicId == this.topicId))
    ).subscribe(filteredComments => {
      this.commentList$ = of(filteredComments);
      this.commentListLength = filteredComments.length;
    }); 
  }

  writeNewComment() {
    if (this.commentInputText.trim() !== '') {    

      const data = {
        "userId": this.userId,
        "topicId": this.topicId,
        "body": this.commentInputText,
        "timestamp": this.formattedDate
      }
      console.log(data)

      this.apiservice.addComment(data).subscribe(response => {
        // successful API call deletes the input
        this.commentInputText = '';
        this.openSnackBar("The new comment is successfully added");
        this.getComments();
      }, error => {
        this.openSnackBar('Something went wrong: ', error);
        console.log('Something went wrong: ', error)
      });
    }
  }

  openSnackBar(message: string, action: string = '') {
    this.snackBar.open(message, action, {
      duration: 2000, // A snackbar megjelenési ideje milliszekundumban
    });
  }
}

