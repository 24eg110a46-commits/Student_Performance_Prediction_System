package com.spps.controller;

import com.spps.dto.MlStatusResponse;
import com.spps.dto.PredictRequest;
import com.spps.dto.PredictionResult;
import com.spps.service.MlClient;
import com.spps.service.PredictionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PredictionController {

    private final PredictionService predictionService;
    private final MlClient mlClient;

    public PredictionController(PredictionService predictionService, MlClient mlClient) {
        this.predictionService = predictionService;
        this.mlClient = mlClient;
    }

    /** Preview a prediction without saving anything. */
    @PostMapping("/predict")
    public PredictionResult predict(@Valid @RequestBody PredictRequest r) {
        return predictionService.predict(r.attendance(), r.studyHours(), r.previousMarks(),
                r.assignmentScore(), r.internalMarks(), r.activities());
    }

    /** Whether the ML service is reachable and how accurate the trained model is. */
    @GetMapping("/ml/status")
    public MlStatusResponse status() {
        return mlClient.metrics()
                .map(m -> new MlStatusResponse(true, m.modelType(), m.accuracy(), m.trainingSamples()))
                .orElse(new MlStatusResponse(false, null, null, null));
    }
}
