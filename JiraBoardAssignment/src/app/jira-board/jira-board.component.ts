import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


interface JiraIssue {

  id: string;

  name: string;

  description: string;

  priority: 'High' | 'Medium' | 'Low';

  storyPoints: number;

}


interface JiraList {

  id: string;

  name: string;

  itemDetails: JiraIssue[];

}


@Component({

  selector: 'app-jira-board',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './jira-board.component.html',

  styleUrl: './jira-board.component.css'

})


export class JiraboardComponent implements OnInit {


  /* =====================================================
     BOARD DATA
  ===================================================== */

  listArray: JiraList[] = [

    {

      id: 'todo',

      name: 'Todo',

      itemDetails: [

        {

          id: 'PROJ-101',

          name: 'Product',

          description: 'Demo Description',

          priority: 'High',

          storyPoints: 5

        },

        {

          id: 'PROJ-102',

          name: 'Bugs',

          description: 'Fix application bugs',

          priority: 'Medium',

          storyPoints: 3

        }

      ]

    },


    {

      id: 'inprogress',

      name: 'In Progress',

      itemDetails: [

        {

          id: 'PROJ-103',

          name: 'Header',

          description: 'Create responsive header',

          priority: 'Low',

          storyPoints: 8

        }

      ]

    },


    {

      id: 'done',

      name: 'Done',

      itemDetails: []

    }

  ];


  /* =====================================================
     SEARCH
  ===================================================== */

  searchText = '';


  /* =====================================================
     LIST MODAL
  ===================================================== */

  showListModal = false;

  listname = '';


  /* =====================================================
     ISSUE MODAL
  ===================================================== */

  showIssueModal = false;

  editingIssue = false;

  editingListIndex = -1;

  editingItemIndex = -1;


  issue: {

    issuename: string;

    description: string;

    priority: 'High' | 'Medium' | 'Low';

    storyPoints: number;

  } = {

    issuename: '',

    description: '',

    priority: 'Medium',

    storyPoints: 3

  };


  /* =====================================================
     ISSUE ID COUNTER
  ===================================================== */

  issueCounter = 104;


  /* =====================================================
     DRAG DATA
  ===================================================== */

  dragData: JiraIssue | null = null;

  sourceListIndex = -1;

  sourceItemIndex = -1;

  dragOverListIndex = -1;


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    const savedData =
      localStorage.getItem('ListArray');


    if (savedData) {

      try {

        const parsedData =
          JSON.parse(savedData);


        if (Array.isArray(parsedData)) {

          this.listArray =
            parsedData.map(
              (list: any) => ({

                ...list,

                itemDetails:
                  Array.isArray(list.itemDetails)

                    ? list.itemDetails.map(
                        (item: any) => ({

                          ...item,

                          description:
                            item.description ??
                            item.Description ??
                            '',

                          storyPoints:
                            Number(item.storyPoints) || 0

                        })
                      )

                    : []

              })
            );

        }

      }

      catch (error) {

        console.error(
          'Invalid local storage data:',
          error
        );

      }

    }


    this.updateIssueCounter();

  }


  /* =====================================================
     SAVE BOARD
  ===================================================== */

  private saveBoard(): void {

    localStorage.setItem(

      'ListArray',

      JSON.stringify(
        this.listArray
      )

    );

  }


  /* =====================================================
     ISSUE COUNTER
  ===================================================== */

  private updateIssueCounter(): void {

    let highestNumber = 103;


    for (
      const list of this.listArray
    ) {

      for (
        const issue of list.itemDetails
      ) {

        const match =
          issue.id.match(
            /PROJ-(\d+)/
          );


        if (match) {

          const number =
            Number(match[1]);


          if (
            number >
            highestNumber
          ) {

            highestNumber =
              number;

          }

        }

      }

    }


    this.issueCounter =
      highestNumber + 1;

  }


  /* =====================================================
     SEARCH
  ===================================================== */

  getVisibleItems(
    list: JiraList
  ): JiraIssue[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      return list.itemDetails;

    }


    return list.itemDetails.filter(
      (issue: JiraIssue) => {

        return (

          issue.name
            .toLowerCase()
            .includes(search)

          ||

          issue.description
            .toLowerCase()
            .includes(search)

          ||

          issue.id
            .toLowerCase()
            .includes(search)

          ||

          issue.priority
            .toLowerCase()
            .includes(search)

          ||

          issue.storyPoints
            .toString()
            .includes(search)

        );

      }
    );

  }


  clearSearch(): void {

    this.searchText = '';

  }


  /* =====================================================
     ORIGINAL INDEX
  ===================================================== */

  getOriginalIndex(
    list: JiraList,
    issue: JiraIssue
  ): number {

    return list.itemDetails.indexOf(
      issue
    );

  }


  /* =====================================================
     LIST MODAL
  ===================================================== */

  openListModal(): void {

    this.listname = '';

    this.showListModal = true;

  }


  closeListModal(): void {

    this.showListModal = false;

    this.listname = '';

  }


  /* =====================================================
     CREATE LIST
  ===================================================== */

  submitList(): void {

    const name =
      this.listname.trim();


    if (!name) {

      alert(
        'Please enter a list name.'
      );

      return;

    }


    const alreadyExists =
      this.listArray.some(

        list =>
          list.name
            .trim()
            .toLowerCase() ===
          name.toLowerCase()

      );


    if (alreadyExists) {

      alert(
        'A list with this name already exists.'
      );

      return;

    }


    const newList: JiraList = {

      id: this.generateId(),

      name: name,

      itemDetails: []

    };


    this.listArray.push(
      newList
    );


    this.saveBoard();

    this.closeListModal();

  }


  /* =====================================================
     DELETE LIST
  ===================================================== */

  removeList(
    index: number
  ): void {

    const list =
      this.listArray[index];


    if (!list) {

      return;

    }


    const confirmed =
      confirm(
        `Are you sure you want to delete "${list.name}"?`
      );


    if (!confirmed) {

      return;

    }


    this.listArray.splice(
      index,
      1
    );


    this.saveBoard();

  }


  /* =====================================================
     OPEN CREATE ISSUE MODAL
  ===================================================== */

  openIssueModal(
    listIndex: number
  ): void {

    if (
      !this.listArray[listIndex]
    ) {

      return;

    }


    this.editingIssue = false;

    this.editingListIndex =
      listIndex;

    this.editingItemIndex =
      -1;


    this.issue = {

      issuename: '',

      description: '',

      priority: 'Medium',

      storyPoints: 3

    };


    this.showIssueModal = true;

  }


  /* =====================================================
     EDIT ISSUE
  ===================================================== */

  editIssue(
    item: JiraIssue,
    listIndex: number,
    itemIndex: number
  ): void {

    if (!item) {

      return;

    }


    if (
      !this.listArray[listIndex]
    ) {

      return;

    }


    if (
      !this.listArray[listIndex]
        .itemDetails[itemIndex]
    ) {

      return;

    }


    this.editingIssue = true;


    this.editingListIndex =
      listIndex;


    this.editingItemIndex =
      itemIndex;


    this.issue = {

      issuename:
        item.name,

      description:
        item.description,

      priority:
        item.priority,

      storyPoints:
        Number(item.storyPoints) || 0

    };


    this.showIssueModal = true;

  }


  /* =====================================================
     EDIT BUTTON HANDLER
  ===================================================== */

  onEditIssue(
    event: MouseEvent,
    item: JiraIssue,
    listIndex: number,
    itemIndex: number
  ): void {

    event.preventDefault();

    event.stopPropagation();


    this.editIssue(
      item,
      listIndex,
      itemIndex
    );

  }


  /* =====================================================
     DELETE BUTTON HANDLER
  ===================================================== */

  onDeleteIssue(
    event: MouseEvent,
    listIndex: number,
    itemIndex: number
  ): void {

    event.preventDefault();

    event.stopPropagation();


    this.removeItems(
      listIndex,
      itemIndex
    );

  }


  /* =====================================================
     CLOSE ISSUE MODAL
  ===================================================== */

  closeIssueModal(): void {

    this.showIssueModal = false;

    this.editingIssue = false;

    this.editingListIndex = -1;

    this.editingItemIndex = -1;


    this.issue = {

      issuename: '',

      description: '',

      priority: 'Medium',

      storyPoints: 3

    };

  }


  /* =====================================================
     CREATE / UPDATE ISSUE
  ===================================================== */

  submitIssue(): void {

    const name =
      this.issue.issuename
        ?.trim();


    const description =
      this.issue.description
        ?.trim();


    /* VALIDATE NAME */

    if (!name) {

      alert(
        'Please enter issue name.'
      );

      return;

    }


    /* VALIDATE DESCRIPTION */

    if (!description) {

      alert(
        'Please enter issue description.'
      );

      return;

    }


    /* VALIDATE STORY POINTS */

    const storyPoints =
      Number(
        this.issue.storyPoints
      );


    if (
      !Number.isFinite(storyPoints) ||
      storyPoints < 0
    ) {

      alert(
        'Please enter valid story points.'
      );

      return;

    }


    /* =================================================
       UPDATE EXISTING ISSUE
    ================================================= */

    if (this.editingIssue) {

      const list =
        this.listArray[
          this.editingListIndex
        ];


      if (!list) {

        alert(
          'Unable to find the list.'
        );

        return;

      }


      const currentIssue =
        list.itemDetails[
          this.editingItemIndex
        ];


      if (!currentIssue) {

        alert(
          'Unable to find the issue.'
        );

        return;

      }


      currentIssue.name =
        name;


      currentIssue.description =
        description;


      currentIssue.priority =
        this.issue.priority;


      currentIssue.storyPoints =
        storyPoints;


      this.saveBoard();

      this.closeIssueModal();

      return;

    }


    /* =================================================
       CREATE NEW ISSUE
    ================================================= */

    const list =
      this.listArray[
        this.editingListIndex
      ];


    if (!list) {

      alert(
        'Please select a valid list.'
      );

      return;

    }


    const newIssue: JiraIssue = {

      id:
        `PROJ-${this.issueCounter}`,

      name:
        name,

      description:
        description,

      priority:
        this.issue.priority,

      storyPoints:
        storyPoints

    };


    this.issueCounter++;


    list.itemDetails.push(
      newIssue
    );


    this.saveBoard();

    this.closeIssueModal();

  }


  /* =====================================================
     DELETE ISSUE
  ===================================================== */

  removeItems(
    listIndex: number,
    itemIndex: number
  ): void {

    const list =
      this.listArray[listIndex];


    if (!list) {

      return;

    }


    const issue =
      list.itemDetails[itemIndex];


    if (!issue) {

      return;

    }


    const confirmed =
      confirm(
        `Delete "${issue.name}"?`
      );


    if (!confirmed) {

      return;

    }


    list.itemDetails.splice(
      itemIndex,
      1
    );


    this.saveBoard();

  }


  /* =====================================================
     DRAG START
  ===================================================== */

  drag(
    event: DragEvent,
    item: JiraIssue,
    listIndex: number,
    itemIndex: number
  ): void {

    this.dragData =
      item;


    this.sourceListIndex =
      listIndex;


    this.sourceItemIndex =
      itemIndex;


    if (event.dataTransfer) {

      event.dataTransfer.effectAllowed =
        'move';


      event.dataTransfer.setData(
        'text/plain',
        item.id
      );

    }

  }


  /* =====================================================
     ALLOW DROP
  ===================================================== */

  allowDrop(
    event: DragEvent,
    listIndex: number
  ): void {

    event.preventDefault();


    this.dragOverListIndex =
      listIndex;


    if (event.dataTransfer) {

      event.dataTransfer.dropEffect =
        'move';

    }

  }


  /* =====================================================
     DRAG LEAVE
  ===================================================== */

  dragLeave(
    listIndex: number
  ): void {

    if (
      this.dragOverListIndex ===
      listIndex
    ) {

      this.dragOverListIndex =
        -1;

    }

  }


  /* =====================================================
     DROP
  ===================================================== */

  drop(
    event: DragEvent,
    targetListIndex: number
  ): void {

    event.preventDefault();


    this.dragOverListIndex =
      -1;


    if (!this.dragData) {

      return;

    }


    if (
      this.sourceListIndex < 0 ||
      this.sourceItemIndex < 0
    ) {

      this.clearDragData();

      return;

    }


    /* SAME LIST */

    if (
      this.sourceListIndex ===
      targetListIndex
    ) {

      this.clearDragData();

      return;

    }


    const sourceList =
      this.listArray[
        this.sourceListIndex
      ];


    const targetList =
      this.listArray[
        targetListIndex
      ];


    if (
      !sourceList ||
      !targetList
    ) {

      this.clearDragData();

      return;

    }


    const issue =
      sourceList.itemDetails[
        this.sourceItemIndex
      ];


    if (!issue) {

      this.clearDragData();

      return;

    }


    /* REMOVE FROM SOURCE */

    sourceList.itemDetails.splice(
      this.sourceItemIndex,
      1
    );


    /* ADD TO TARGET */

    targetList.itemDetails.push(
      issue
    );


    this.saveBoard();


    this.clearDragData();

  }


  /* =====================================================
     DRAG END
  ===================================================== */

  dragEnd(): void {

    this.clearDragData();

  }


  /* =====================================================
     CLEAR DRAG
  ===================================================== */

  private clearDragData(): void {

    this.dragData = null;

    this.sourceListIndex = -1;

    this.sourceItemIndex = -1;

    this.dragOverListIndex = -1;

  }


  /* =====================================================
     PRIORITY CLASS
  ===================================================== */

  getPriorityClass(
    priority: string
  ): string {

    switch (priority) {

      case 'High':

        return 'priority-high';


      case 'Low':

        return 'priority-low';


      case 'Medium':

      default:

        return 'priority-medium';

    }

  }


  /* =====================================================
     PRIORITY ICON
  ===================================================== */

  getPriorityIcon(
    priority: string
  ): string {

    switch (priority) {

      case 'High':

        return 'bi-arrow-up';


      case 'Low':

        return 'bi-arrow-down';


      case 'Medium':

      default:

        return 'bi-dash';

    }

  }


  /* =====================================================
     STATUS CLASS
  ===================================================== */

  getStatusClass(
    name: string
  ): string {

    const status =
      name.toLowerCase();


    if (
      status.includes('done') ||
      status.includes('complete')
    ) {

      return 'status-done';

    }


    if (
      status.includes('progress') ||
      status.includes('review')
    ) {

      return 'status-progress';

    }


    return 'status-todo';

  }


  /* =====================================================
     GENERATE ID
  ===================================================== */

  private generateId(): string {

    return (

      Date.now().toString(36) +

      Math.random()
        .toString(36)
        .substring(2, 7)

    );

  }

}