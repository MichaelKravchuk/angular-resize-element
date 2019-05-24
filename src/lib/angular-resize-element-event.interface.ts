import {AngularResizeElementDirection} from './angular-resize-element.enum';

export interface AngularResizeElementEvent {
    currentWidthValue: number;
    currentHeightValue: number;
    originalWidthValue: number;
    originalHeightValue: number;
    differenceWidthValue: number;
    differenceHeightValue: number;
    originalEvent: MouseEvent;
    direction: AngularResizeElementDirection;
}
