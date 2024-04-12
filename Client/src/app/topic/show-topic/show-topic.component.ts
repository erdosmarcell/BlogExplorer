import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogApiService } from '../../blog-api.service';
import { CommonModule } from '@angular/common'; 
import { AddEditTopicComponent } from '../add-edit-topic/add-edit-topic.component';

// Decorator that marks a class as an Angular component, providing template and style information.
@Component({
  selector: 'app-show-topic', // The CSS selector that identifies this component in a template
  standalone: true, // Marks this component as standalone, meaning it can be imported without needing to be declared in a module.
  imports: [CommonModule, AddEditTopicComponent], // Imports CommonModule for common directives like ngIf, ngFor, etc.
  templateUrl: './show-topic.component.html', // Location of the component's template file.
  styleUrls: ['./show-topic.component.css'] // Location of the component's private CSS styles.
})
export class ShowTopicComponent implements OnInit{ // The component class that implements the OnInit lifecycle hook.

  // Properties to hold observables for topic list and topic types list
  topicList$!:Observable<any[]>; // Observable to hold the list of topics, fetched from the BlogApiService
  topicTypesList$!:Observable<any[]>; // Observable to hold the list of topic types, if needed in future expansion.
  topicTypesList:any=[]; // Array to hold topic types, currently not populated in ngOnInit.

  // Map to display data associated with foreign keys. Maps topic type IDs to their string representations.
  topicTypesMap:Map<number, string> = new Map()

  // Constructor that injects the BlogApiService for fetching data
  constructor(private service:BlogApiService) {}

  ngOnInit(): void {
    // On component initialization, fetch the topic list from the BlogApiService and assign it to the topicList$ observable.
    this.topicList$ = this.service.getTopicList();
    this.topicTypesList$ = this.service.getTopicTypeList();
    this.refreshTopicTypesMap();
  }

  // Variables (properties)
  modalTitle:string = '';
  activateAddEditTopicComponent:boolean = false;
  topic:any;

  modalAdd() {
    this.topic = {
      topicId: 0,
      name: null,
      topicTypeId: 0,
      description: null
    }
    this.modalTitle = "Add New Topic";
    this.activateAddEditTopicComponent = true;
  }

  modalEdit(item:any){
    this.topic = item;
    this.modalTitle = "Edit Topic";
    this.activateAddEditTopicComponent = true;

  }

  delete(item:any){
    if(confirm(`Are you sure you want to delete topic ${item.name}`)){
      this.service.deleteTopic(item.topicId).subscribe(res => {
    
          var closeModalBtn = document.getElementById('add-edit-modal-close');
          if(closeModalBtn) {
            closeModalBtn.click();
          }
          var showDeleteSuccess = document.getElementById('delete-success-alert');
          if(showDeleteSuccess) {
            showDeleteSuccess.style.display = "block";
          }
          setTimeout(function(){
            if(showDeleteSuccess) {
              showDeleteSuccess.style.display = "none"
            }
          }, 4000);
          this.topicList$ = this.service.getTopicList();
      })
    }
  }

  modalClose() {
    this.activateAddEditTopicComponent = false;
    this.topicList$ = this.service.getTopicList();
  }

  refreshTopicTypesMap() {
    this.service.getTopicTypeList().subscribe(data => {
      this.topicTypesList = data;

      for(let i = 0; i < data.length; i++){
        this.topicTypesMap.set(this.topicTypesList[i].topicTypeId, this.topicTypesList[i].name)
      }
    })
  }

}
