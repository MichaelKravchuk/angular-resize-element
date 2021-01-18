import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2} from '@angular/core';
import {AngularResizeElementEvent, Position} from './angular-resize-element-event.interface';
import {AngularResizeElementDirection} from './angular-resize-element.enum';

@Directive({
    selector: '[resize], [resizeStart], [resizeEnd]'
})
export class AngularResizeElementDirective {
    private mouseUpListener: () => void;
    private mouseMoveListener: () => void;

    private targetElementWidthValue: number;
    private targetElementHeightValue: number;

    private targetElementTopValue: number;
    private targetElementLeftValue: number;

    private originalEvent: MouseEvent;

    @Input()
    public targetElement: HTMLElement | ElementRef;

    @Input()
    public direction: AngularResizeElementDirection;

    @Input()
    public proportionalResize: boolean;

    @Input()
    public rect: Position;

    @Input()
    public applyClass = 'resizing';

    @Output()
    public readonly resizeStart: EventEmitter<AngularResizeElementEvent> = new EventEmitter();

    @Output()
    public readonly resize: EventEmitter<AngularResizeElementEvent> = new EventEmitter();

    @Output()
    public readonly resizeEnd: EventEmitter<AngularResizeElementEvent> = new EventEmitter();


    constructor(private readonly elementRef: ElementRef,
                private readonly renderer2: Renderer2
    ) {
    }


    @HostListener('mousedown', ['$event'])
    public onMouseDown(evt: MouseEvent): void {
        evt.preventDefault();

        this.setOriginalData(evt);

        this.resizeStart.emit(this.generateValuesForEvent(evt));

        this.mouseUpListener = this.renderer2.listen('document', 'mouseup', event => this.onMouseUp(event));
        this.mouseMoveListener = this.renderer2.listen('document', 'mousemove', event => this.onMouseMove(event));
        this.renderer2.addClass(this.targetNativeElement, this.applyClass);
    }


    private onMouseUp(evt: MouseEvent): void {
        const eventValues = this.generateValuesForEvent(evt);
        this.resize.emit(eventValues);
        this.mouseMoveListener();
        this.mouseUpListener();

        this.renderer2.removeClass(this.targetNativeElement, this.applyClass);
        this.resizeEnd.emit(eventValues);
    }


    private onMouseMove(evt: MouseEvent): void {
        this.resize.emit(this.generateValuesForEvent(evt));
    }


    private setOriginalData(originalEvent: MouseEvent) {
        this.originalEvent = originalEvent;

        if (this.targetElement) {
            const dataSource = this.targetNativeElement;
            this.targetElementWidthValue = dataSource.offsetWidth;
            this.targetElementHeightValue = dataSource.offsetHeight;
            this.targetElementTopValue = dataSource.offsetTop;
            this.targetElementLeftValue = dataSource.offsetLeft;
        } else {
            this.targetElementWidthValue = 0;
            this.targetElementHeightValue = 0;
            this.targetElementTopValue = 0;
            this.targetElementLeftValue = 0;
        }
    }

    private get targetNativeElement(): HTMLElement {
        return this.targetElement instanceof ElementRef ? this.targetElement.nativeElement : this.targetElement;
    }

    private generateValuesForEvent(evt: MouseEvent): AngularResizeElementEvent {
        const originalXValue = this.originalEvent.clientX;
        const originalYValue = this.originalEvent.clientY;

        let diffWidthValue = evt.clientX - originalXValue;
        let diffHeightValue = evt.clientY - originalYValue;
        let diffTopValue = diffHeightValue;
        let diffLeftValue = diffWidthValue;

        switch (this.direction) {
            case AngularResizeElementDirection.TOP: {
                diffHeightValue *= -1;
                diffWidthValue = 0;
                diffLeftValue = 0;
                break;
            }
            case AngularResizeElementDirection.TOP_RIGHT: {
                diffHeightValue *= -1;
                diffLeftValue = 0;
                break;
            }
            case AngularResizeElementDirection.RIGHT: {
                diffHeightValue = 0;
                diffTopValue = 0;
                diffLeftValue = 0;
                break;
            }
            case AngularResizeElementDirection.BOTTOM_RIGHT: {
                diffTopValue = 0;
                diffLeftValue = 0;
                break;
            }
            case AngularResizeElementDirection.BOTTOM: {
                diffWidthValue = 0;
                diffLeftValue = 0;
                diffTopValue = 0;
                break;
            }
            case AngularResizeElementDirection.BOTTOM_LEFT: {
                diffWidthValue *= -1;
                diffTopValue = 0;
                break;
            }
            case AngularResizeElementDirection.LEFT: {
                diffWidthValue *= -1;
                diffHeightValue = 0;
                diffTopValue = 0;
                break;
            }
            case AngularResizeElementDirection.TOP_LEFT: {
                diffHeightValue *= -1;
                diffWidthValue *= -1;
            }
        }

        let currentWidthValue = this.targetElementWidthValue + diffWidthValue;
        let currentHeightValue = this.targetElementHeightValue + diffHeightValue;

        if (this.proportionalResize) {
            if (currentWidthValue > currentHeightValue) {
                currentWidthValue = currentHeightValue;
            } else {
                currentHeightValue = currentWidthValue;
            }
        }

        if (currentHeightValue <= 1) {
            diffTopValue += currentHeightValue;
        }

        if (currentWidthValue <= 1) {
            diffLeftValue += currentWidthValue;
        }

        if (currentWidthValue <= 0) {
            currentWidthValue = 0;
        }

        if (currentHeightValue <= 0) {
            currentHeightValue = 0;
        }

        let currentTopValue = this.targetElementTopValue + diffTopValue;
        let currentLeftValue = this.targetElementLeftValue + diffLeftValue;

        if (this.rect) {
            if (currentTopValue < this.rect.top) {
                currentHeightValue = this.targetElementHeightValue + this.targetElementTopValue - this.rect.top;
                currentTopValue = this.rect.top;
            }
            if (currentHeightValue + currentTopValue > this.rect.height) {
                currentHeightValue = this.rect.height - currentTopValue;
            }

            if (currentLeftValue < this.rect.left) {
                currentWidthValue = this.targetElementWidthValue + this.targetElementLeftValue - this.rect.left;
                currentLeftValue = this.rect.left;
            }
            if (currentWidthValue + currentLeftValue > this.rect.width) {
                currentWidthValue = this.rect.width - currentLeftValue;
            }
        }

        return {
            originalEvent: this.originalEvent,
            currentWidthValue,
            currentHeightValue,
            currentTopValue,
            currentLeftValue,
            originalWidthValue: this.targetElementWidthValue,
            originalHeightValue: this.targetElementHeightValue,
            originalTopValue: this.targetElementTopValue,
            originalLeftValue: this.targetElementLeftValue,
            differenceWidthValue: currentWidthValue - this.targetElementWidthValue,
            differenceHeightValue: currentHeightValue - this.targetElementHeightValue,
            differenceTopValue: currentTopValue - this.targetElementTopValue,
            differenceLeftValue: currentLeftValue - this.targetElementLeftValue,
            direction: this.direction,
        };
    }
}

