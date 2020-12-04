import {Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2} from '@angular/core';
import {AngularResizeElementEvent} from './angular-resize-element-event.interface';
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
    public readonly targetElement: HTMLElement | ElementRef;

    @Input()
    public readonly direction: AngularResizeElementDirection;

    @Input()
    public readonly proportionalResize: boolean;

    @Input()
    public readonly applyClass = 'resizes';

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
        this.renderer2.addClass(this.elementRef.nativeElement, 'resizes');
    }


    private onMouseUp(evt: MouseEvent): void {
        const eventValues = this.generateValuesForEvent(evt);
        this.resize.emit(eventValues);
        this.mouseMoveListener();
        this.mouseUpListener();

        this.renderer2.removeClass(this.elementRef.nativeElement, this.applyClass);
        this.resizeEnd.emit(eventValues);
    }


    private onMouseMove(evt: MouseEvent): void {
        this.resize.emit(this.generateValuesForEvent(evt));
    }


    private setOriginalData(originalEvent: MouseEvent) {
        this.originalEvent = originalEvent;

        if (this.targetElement) {
            const dataSource = this.targetElement instanceof ElementRef ? this.targetElement.nativeElement : this.targetElement;
            this.targetElementWidthValue = dataSource.offsetWidth;
            this.targetElementHeightValue = dataSource.offsetHeight;
            this.targetElementTopValue = dataSource.offsetTop;
            this.targetElementLeftValue = dataSource.offsetLeft;
        } else {
            this.targetElementWidthValue = 0;
            this.targetElementHeightValue = 0;
        }
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

        return {
            originalEvent: this.originalEvent,
            currentWidthValue: currentWidthValue,
            currentHeightValue: currentHeightValue,
            currentTopValue: this.targetElementTopValue + diffTopValue,
            currentLeftValue: this.targetElementLeftValue + diffLeftValue,
            originalWidthValue: this.targetElementWidthValue,
            originalHeightValue: this.targetElementHeightValue,
            originalTopValue: this.targetElementTopValue,
            originalLeftValue: this.targetElementLeftValue,
            differenceWidthValue: this.targetElementWidthValue - currentWidthValue,
            differenceHeightValue: this.targetElementHeightValue - currentHeightValue,
            differenceTopValue: this.targetElementTopValue - diffTopValue,
            differenceLeftValue: this.targetElementLeftValue - diffLeftValue,
            direction: this.direction,
        };
    }
}

