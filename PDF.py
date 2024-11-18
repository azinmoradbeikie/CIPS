import numpy as np
from numpy import loadtxt
import pickle
from sklearn.neighbors import KernelDensity


# load the dataset
dataset = loadtxt('Localization_27_11_2023.csv', delimiter=',', encoding='utf-8-sig')
dataset[dataset == 0] = -120

X = dataset[:,0:7]

print(X[1,:])

y = dataset[:,7]
print(y[1])

# Preprocess the RSSI measurements if needed
# ...

# Build PDFs for each reference point
pdfs = []
for label in np.unique(y):
    # Select the RSSI measurements for the current reference point
    rssi_measurements = X[y == label, :]

    # Create a kernel density estimator
    kde = KernelDensity(bandwidth=1)  # You can adjust the bandwidth value as needed

    # Fit the KDE to the data
    kde.fit(rssi_measurements)

    # Add the fitted KDE to the list of PDFs
    pdfs.append((label, kde))

# Now you have a list of PDFs for each reference point
# Each PDF is associated with its corresponding label/reference point
# You can use these PDFs for localization or other purposes
print(pdfs)

new_measurement = np.array([-82,-89,-120,-120,-120,-120,-96]) # Example measurement

# Compute the log-probabilities for each reference point using the PDFs
log_probs = []
for label, kde in pdfs:
    log_prob = kde.score_samples(new_measurement.reshape(1, -1))
    log_probs.append((label, log_prob))

# Find the reference point with the highest log-probability
best_label, best_log_prob = max(log_probs, key=lambda x: x[1])

# Perform localization using the best reference point
print("Localization result:")
print("Best Reference Point:", best_label)
print("Log Probability:", best_log_prob)

with open('Localization_27_11_2023.pkl', 'wb') as file:
    pickle.dump(pdfs, file)
